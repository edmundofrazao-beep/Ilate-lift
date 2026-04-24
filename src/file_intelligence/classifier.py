from __future__ import annotations

import hashlib
import json
import os
import re
from collections.abc import Callable
from dataclasses import asdict
from typing import Any

from openai import OpenAI
from tqdm import tqdm

from .config import PipelineConfig
from .heuristics import heuristic_classify, normalize_category
from .jsonl import JsonlWriter
from .models import ClassificationDecision
from .storage import StateStore


SYSTEM_PROMPT = """You classify filesystem documents into one of these exact categories:
- Esquemas Eletricos
- Manuais
- Documentacao Tecnica
- Normas de Seguranca
- Ficheiros de Engenharia

Return strict JSON only as:
{"items":[{"path":"...","category":"...","confidence":0.0-1.0,"rationale":"...","family_hint":"optional short project/family hint"}]}

Use filename, extension and snippet. Be conservative. """


def chunked(items: list[Any], size: int) -> list[list[Any]]:
    return [items[index : index + size] for index in range(0, len(items), size)]


def strip_json_fences(text: str) -> str:
    cleaned = text.strip()
    cleaned = re.sub(r"^```json\s*", "", cleaned)
    cleaned = re.sub(r"^```\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


class Classifier:
    def __init__(self, config: PipelineConfig, state: StateStore, writer: JsonlWriter, logger) -> None:
        self.config = config
        self.state = state
        self.writer = writer
        self.logger = logger
        self.client = OpenAI() if os.getenv("OPENAI_API_KEY") else None

    def run(self) -> dict[str, int]:
        source_prefix = f"{self.config.source_root.resolve()}/"
        unclassified = self.state.iter_unclassified(self.config.classification_limit, path_prefix=source_prefix)
        if not unclassified:
            self.logger.info("classification_noop no_unclassified_files")
            return {"classified": 0, "heuristic_only": 0, "refined": 0}

        stage1_results = self._classify_stage(unclassified, "stage1", self.config.stage1_model, self.config.stage1_batch_size)
        low_confidence_records = [
            row for row in unclassified if stage1_results[row["path"]].confidence < self.config.low_confidence_threshold
        ]

        stage2_results: dict[str, ClassificationDecision] = {}
        if low_confidence_records:
            stage2_results = self._classify_stage(low_confidence_records, "stage2", self.config.stage2_model, self.config.stage2_batch_size, detailed=True)

        classified = 0
        heuristic_only = 0
        refined = 0

        for row in tqdm(unclassified, desc="classify", unit="file"):
            decision = stage2_results.get(row["path"]) or stage1_results[row["path"]]
            heuristic_category, heuristic_confidence, heuristic_reason = heuristic_classify(row["path"], row["snippet"])
            if heuristic_category and heuristic_confidence >= decision.confidence:
                decision = ClassificationDecision(
                    path=row["path"],
                    rel_path=row["rel_path"],
                    sha1=row["sha1"],
                    category=normalize_category(heuristic_category),
                    confidence=heuristic_confidence,
                    stage=f"{decision.stage}+heuristic",
                    rationale=heuristic_reason,
                    heuristic_override=True,
                    family_hint=decision.family_hint,
                )
            if not self.client and decision.stage == "heuristic":
                heuristic_only += 1
            if row["path"] in stage2_results:
                refined += 1
            self.state.save_classification(decision)
            self.writer.write(decision.to_dict())
            classified += 1

        self.logger.info(
            "classification_complete classified=%s refined=%s heuristic_only=%s",
            classified,
            refined,
            heuristic_only,
        )
        return {"classified": classified, "heuristic_only": heuristic_only, "refined": refined}

    def _classify_stage(
        self,
        rows: list[Any],
        stage: str,
        model: str,
        batch_size: int,
        detailed: bool = False,
    ) -> dict[str, ClassificationDecision]:
        results: dict[str, ClassificationDecision] = {}
        total_batches = (len(rows) + batch_size - 1) // batch_size if rows else 0
        for batch_index, batch in enumerate(chunked(rows, batch_size), start=1):
            uncached_rows = []
            prompt_fingerprint = self._prompt_fingerprint(batch, detailed=detailed)
            for row in batch:
                cached = self.state.get_ai_cache(row["sha1"], stage, model, prompt_fingerprint)
                if cached:
                    results[row["path"]] = ClassificationDecision(
                        path=row["path"],
                        rel_path=row["rel_path"],
                        sha1=row["sha1"],
                        category=normalize_category(cached["category"]),
                        confidence=float(cached["confidence"]),
                        stage=stage,
                        rationale=cached["rationale"],
                        family_hint=row["filename"].rsplit(".", 1)[0],
                    )
                else:
                    uncached_rows.append(row)

            if not uncached_rows:
                continue

            self.logger.info(
                "classification_batch stage=%s model=%s batch=%s/%s size=%s uncached=%s",
                stage,
                model,
                batch_index,
                total_batches,
                len(batch),
                len(uncached_rows),
            )

            if self.client is None:
                self._apply_heuristic_batch(uncached_rows, results)
                continue

            try:
                parsed_items = self._call_openai(uncached_rows, model=model, detailed=detailed)
            except Exception as exc:
                self.logger.exception(
                    "classification_batch_failed stage=%s model=%s batch=%s/%s fallback=heuristic error=%s",
                    stage,
                    model,
                    batch_index,
                    total_batches,
                    exc,
                )
                self._apply_heuristic_batch(uncached_rows, results)
                continue

            item_map = {item["path"]: item for item in parsed_items}
            for row in uncached_rows:
                payload = item_map.get(row["path"], {})
                category = normalize_category(payload.get("category"))
                confidence = float(payload.get("confidence", 0.0) or 0.0)
                rationale = str(payload.get("rationale", "missing_ai_payload"))
                family_hint = payload.get("family_hint") or self._guess_family_hint(row["filename"], row["rel_path"])
                decision = ClassificationDecision(
                    path=row["path"],
                    rel_path=row["rel_path"],
                    sha1=row["sha1"],
                    category=category,
                    confidence=confidence,
                    stage=stage,
                    rationale=rationale,
                    family_hint=family_hint,
                )
                results[row["path"]] = decision
                self.state.save_ai_cache(row["sha1"], stage, model, prompt_fingerprint, category, confidence, rationale)
        return results

    def _call_openai(self, rows: list[Any], model: str, detailed: bool) -> list[dict[str, Any]]:
        items = []
        for row in rows:
            items.append(
                {
                    "path": row["path"],
                    "filename": row["filename"],
                    "extension": row["extension"],
                    "snippet": row["snippet"][: self.config.snippet_chars],
                    "rel_path": row["rel_path"],
                }
            )

        user_prompt = {
            "mode": "detailed" if detailed else "fast",
            "items": items,
        }
        response = self.client.responses.create(
            model=model,
            input=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": json.dumps(user_prompt, ensure_ascii=False)},
            ],
            timeout=60.0,
        )
        text = getattr(response, "output_text", "") or ""
        payload = json.loads(strip_json_fences(text))
        return payload.get("items", [])

    def _apply_heuristic_batch(
        self,
        rows: list[Any],
        results: dict[str, ClassificationDecision],
    ) -> None:
        for row in rows:
            category, confidence, reason = heuristic_classify(row["path"], row["snippet"])
            results[row["path"]] = ClassificationDecision(
                path=row["path"],
                rel_path=row["rel_path"],
                sha1=row["sha1"],
                category=normalize_category(category),
                confidence=max(confidence, 0.2),
                stage="heuristic",
                rationale=reason,
                heuristic_override=True,
                family_hint=self._guess_family_hint(row["filename"], row["rel_path"]),
            )

    def _prompt_fingerprint(self, rows: list[Any], detailed: bool) -> str:
        raw = json.dumps(
            {
                "detailed": detailed,
                "items": [
                    {"sha1": row["sha1"], "path": row["path"], "snippet": row["snippet"][: self.config.snippet_chars]}
                    for row in rows
                ],
            },
            ensure_ascii=False,
            sort_keys=True,
        )
        return hashlib.sha1(raw.encode("utf-8")).hexdigest()

    def _guess_family_hint(self, filename: str, rel_path: str) -> str:
        stem = filename.rsplit(".", 1)[0]
        stem = re.sub(r"[_\-\s]+", " ", stem)
        stem = re.sub(r"\b(v\d+|copy|final|draft|scan)\b", "", stem, flags=re.I)
        stem = re.sub(r"\s+", " ", stem).strip()
        if stem:
            return stem[:80]
        return rel_path.split("/", 1)[0]
