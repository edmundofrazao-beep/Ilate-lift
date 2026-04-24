from __future__ import annotations

import csv
import json
import os
import re
from pathlib import Path
from typing import Any

from openai import OpenAI
from tqdm import tqdm

from .extractors import extract_text_snippet
from .themes import OCR_SUFFIXES


SEMANTIC_SYSTEM_PROMPT = """You analyze elevator industry documents and propose a better semantic classification.

Return strict JSON only:
{"items":[{"doc_id":"...","theme":"...","doc_type":"...","suggested_title":"...","language":"...","confidence":0.0,"reason":"..."}]}

Rules:
- Keep suggestions concise and practical for a technical library.
- suggested_title should be a clean human title, not a full filename.
- doc_type examples: Manual, Datasheet, Wiring Diagram, Parameters, Certification, Parts Catalog, Technical Note, Software Tool, Image, Unknown.
- theme should be a useful subfamily inside the current category.
- If unsure, say Unknown and lower confidence.
"""


def strip_json_fences(text: str) -> str:
    cleaned = text.strip()
    cleaned = re.sub(r"^```json\s*", "", cleaned)
    cleaned = re.sub(r"^```\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def chunked(items: list[Any], size: int) -> list[list[Any]]:
    return [items[index : index + size] for index in range(0, len(items), size)]


class SemanticApiProcessor:
    def __init__(
        self,
        library_root: Path,
        data_dir: Path,
        logger,
        *,
        model: str = "gpt-5.4-mini",
        batch_size: int = 8,
        limit: int = 80,
    ) -> None:
        self.library_root = library_root
        self.data_dir = data_dir
        self.logger = logger
        self.model = model
        self.batch_size = batch_size
        self.limit = limit
        self.client = OpenAI()

    def run(self) -> dict[str, int | str]:
        queue_path = self.data_dir / "organized_v5_api_queue_priority.csv"
        out_csv = self.data_dir / "organized_v5_semantic_api_results.csv"
        out_jsonl = self.data_dir / "organized_v5_semantic_api_results.jsonl"

        existing_doc_ids = self._existing_doc_ids(out_csv)
        candidates = self._load_candidates(queue_path, existing_doc_ids)
        candidates = candidates[: self.limit]
        processed = 0
        processed_doc_ids = {row["doc_id"] for row in candidates}

        with out_csv.open("a", encoding="utf-8", newline="") as f_csv, out_jsonl.open("a", encoding="utf-8") as f_jsonl:
            writer = csv.writer(f_csv)
            if out_csv.stat().st_size == 0:
                writer.writerow(
                    [
                        "doc_id",
                        "relative_path",
                        "category",
                        "brand",
                        "priority",
                        "strategy",
                        "theme",
                        "doc_type",
                        "suggested_title",
                        "language",
                        "confidence",
                        "reason",
                    ]
                )

            for batch_index, batch in enumerate(tqdm(chunked(candidates, self.batch_size), desc="semantic-api", unit="batch"), start=1):
                self.logger.info(
                    "semantic_api_batch batch=%s size=%s model=%s",
                    batch_index,
                    len(batch),
                    self.model,
                )
                payload = []
                for row in batch:
                    file_path = self.library_root / row["relative_path"]
                    snippet, snippet_source = extract_text_snippet(file_path, 1800)
                    payload.append(
                        {
                            "doc_id": row["doc_id"],
                            "relative_path": row["relative_path"],
                            "category": row["category"],
                            "brand": row["brand"],
                            "filename": row["filename"],
                            "priority": row["priority"],
                            "strategy": row["strategy"],
                            "snippet_source": snippet_source,
                            "snippet": snippet[:1800],
                        }
                    )

                items = self._call_openai(payload)
                item_map = {item["doc_id"]: item for item in items}
                for row in batch:
                    result = item_map.get(row["doc_id"], {})
                    out_row = {
                        "doc_id": row["doc_id"],
                        "relative_path": row["relative_path"],
                        "category": row["category"],
                        "brand": row["brand"],
                        "priority": row["priority"],
                        "strategy": row["strategy"],
                        "theme": result.get("theme", "Unknown"),
                        "doc_type": result.get("doc_type", "Unknown"),
                        "suggested_title": result.get("suggested_title", row["filename"]),
                        "language": result.get("language", "Unknown"),
                        "confidence": result.get("confidence", 0.0),
                        "reason": result.get("reason", "missing_ai_payload"),
                    }
                    writer.writerow(
                        [
                            out_row["doc_id"],
                            out_row["relative_path"],
                            out_row["category"],
                            out_row["brand"],
                            out_row["priority"],
                            out_row["strategy"],
                            out_row["theme"],
                            out_row["doc_type"],
                            out_row["suggested_title"],
                            out_row["language"],
                            out_row["confidence"],
                            out_row["reason"],
                        ]
                    )
                    f_jsonl.write(json.dumps(out_row, ensure_ascii=False) + "\n")
                    processed += 1

        self.logger.info("semantic_api_complete processed=%s model=%s limit=%s", processed, self.model, self.limit)
        return {
            "processed": processed,
            "model": self.model,
            "limit": self.limit,
            "remaining_after_run": len(self._load_candidates(queue_path, existing_doc_ids | processed_doc_ids)),
            "results_csv": str(out_csv),
        }

    def _load_candidates(self, path: Path, exclude_doc_ids: set[str] | None = None) -> list[dict[str, str]]:
        exclude_doc_ids = exclude_doc_ids or set()
        with path.open("r", encoding="utf-8", newline="") as handle:
            all_rows = [row for row in csv.DictReader(handle) if row["doc_id"] not in exclude_doc_ids]

        tier_predicates = [
            lambda row: row["priority"] == "high" and row["strategy"] == "api",
            lambda row: row["priority"] == "medium" and row["strategy"] == "api",
            lambda row: row["priority"] == "high",
            lambda row: True,
        ]
        for predicate in tier_predicates:
            rows = [row for row in all_rows if predicate(row)]
            if rows:
                return rows
        return []

    def _call_openai(self, payload: list[dict[str, Any]]) -> list[dict[str, Any]]:
        response = self.client.responses.create(
            model=self.model,
            input=[
                {"role": "system", "content": SEMANTIC_SYSTEM_PROMPT},
                {"role": "user", "content": json.dumps({"items": payload}, ensure_ascii=False)},
            ],
            timeout=90.0,
        )
        text = getattr(response, "output_text", "") or ""
        parsed = json.loads(strip_json_fences(text))
        return parsed.get("items", [])

    def _existing_doc_ids(self, path: Path) -> set[str]:
        if not path.exists():
            return set()
        with path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            return {row["doc_id"] for row in reader if row.get("doc_id")}
