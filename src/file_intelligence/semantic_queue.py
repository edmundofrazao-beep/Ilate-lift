from __future__ import annotations

import csv
import json
from pathlib import Path

from .themes import API_SUFFIXES, NON_DOCUMENT_SUFFIXES, OCR_SUFFIXES, infer_theme, is_weak_name


class SemanticQueuePlanner:
    def __init__(self, library_root: Path, data_dir: Path, logger) -> None:
        self.library_root = library_root
        self.data_dir = data_dir
        self.logger = logger

    def run(self) -> dict[str, int | str]:
        manifest_path = self.data_dir / "organized_v5_baseline_manifest.csv"
        theme_csv = self.data_dir / "organized_v5_theme_plan.csv"
        theme_jsonl = self.data_dir / "organized_v5_theme_plan.jsonl"
        api_csv = self.data_dir / "organized_v5_api_queue.csv"
        api_jsonl = self.data_dir / "organized_v5_api_queue.jsonl"
        api_priority_csv = self.data_dir / "organized_v5_api_queue_priority.csv"

        rows = list(self._iter_manifest(manifest_path))
        planned = 0
        api_count = 0
        ocr_count = 0
        priority_count = 0

        with (
            theme_csv.open("w", encoding="utf-8", newline="") as f_theme_csv,
            theme_jsonl.open("w", encoding="utf-8") as f_theme_jsonl,
            api_csv.open("w", encoding="utf-8", newline="") as f_api_csv,
            api_jsonl.open("w", encoding="utf-8") as f_api_jsonl,
            api_priority_csv.open("w", encoding="utf-8", newline="") as f_api_priority_csv,
        ):
            theme_writer = csv.writer(f_theme_csv)
            api_writer = csv.writer(f_api_csv)
            api_priority_writer = csv.writer(f_api_priority_csv)
            theme_writer.writerow(
                ["doc_id", "relative_path", "category", "brand", "filename", "theme", "confidence", "reason", "needs_api", "needs_ocr"]
            )
            api_writer.writerow(
                ["doc_id", "relative_path", "category", "brand", "filename", "theme_candidate", "reason", "strategy", "priority"]
            )
            api_priority_writer.writerow(
                ["doc_id", "relative_path", "category", "brand", "filename", "theme_candidate", "reason", "strategy", "priority"]
            )

            for row in rows:
                rel_path = row["relative_path"]
                parts = Path(rel_path).parts
                if len(parts) < 3:
                    continue
                category, brand = parts[0], parts[1]
                filename = row["filename"]
                suffix = row["suffix"].lower()
                decision = infer_theme(category, filename, rel_path)

                if suffix in NON_DOCUMENT_SUFFIXES:
                    needs_api = False
                    needs_ocr = False
                else:
                    weak = is_weak_name(filename)
                    low_confidence = decision.confidence < 0.35
                    needs_api = decision.needs_api or (low_confidence and suffix in API_SUFFIXES) or weak
                    needs_ocr = weak and suffix in OCR_SUFFIXES
                    if category in {"Documentacao Tecnica", "Ficheiros de Engenharia", "Esquemas Eletricos"} and suffix in OCR_SUFFIXES:
                        needs_ocr = True
                        needs_api = True
                    if category == "duplicates":
                        needs_api = False
                        needs_ocr = False

                weak = is_weak_name(filename)
                low_confidence = decision.confidence < 0.35

                payload = {
                    "doc_id": row["doc_id"],
                    "relative_path": rel_path,
                    "category": category,
                    "brand": brand,
                    "filename": filename,
                    "theme": decision.theme,
                    "confidence": round(decision.confidence, 3),
                    "reason": decision.reason,
                    "needs_api": needs_api,
                    "needs_ocr": needs_ocr,
                }
                theme_writer.writerow(
                    [
                        payload["doc_id"],
                        payload["relative_path"],
                        payload["category"],
                        payload["brand"],
                        payload["filename"],
                        payload["theme"],
                        payload["confidence"],
                        payload["reason"],
                        int(needs_api),
                        int(needs_ocr),
                    ]
                )
                f_theme_jsonl.write(json.dumps(payload, ensure_ascii=False) + "\n")
                planned += 1

                if needs_api:
                    priority = self._priority_for(
                        category=category,
                        filename=filename,
                        theme=decision.theme,
                        weak=weak,
                        needs_ocr=needs_ocr,
                        low_confidence=low_confidence,
                    )
                    strategy = "ocr+api" if needs_ocr else "api"
                    api_payload = {
                        "doc_id": row["doc_id"],
                        "relative_path": rel_path,
                        "category": category,
                        "brand": brand,
                        "filename": filename,
                        "theme_candidate": decision.theme,
                        "reason": decision.reason if not weak else f"weak_name; {decision.reason}",
                        "strategy": strategy,
                        "priority": priority,
                    }
                    api_writer.writerow(
                        [
                            api_payload["doc_id"],
                            api_payload["relative_path"],
                            api_payload["category"],
                            api_payload["brand"],
                            api_payload["filename"],
                            api_payload["theme_candidate"],
                            api_payload["reason"],
                            api_payload["strategy"],
                            api_payload["priority"],
                        ]
                    )
                    f_api_jsonl.write(json.dumps(api_payload, ensure_ascii=False) + "\n")
                    api_count += 1
                    if needs_ocr:
                        ocr_count += 1
                    if priority in {"high", "medium"}:
                        api_priority_writer.writerow(
                            [
                                api_payload["doc_id"],
                                api_payload["relative_path"],
                                api_payload["category"],
                                api_payload["brand"],
                                api_payload["filename"],
                                api_payload["theme_candidate"],
                                api_payload["reason"],
                                api_payload["strategy"],
                                api_payload["priority"],
                            ]
                        )
                        priority_count += 1

        self.logger.info(
            "semantic_queue_complete planned=%s api_queue=%s ocr_queue=%s priority_queue=%s",
            planned,
            api_count,
            ocr_count,
            priority_count,
        )
        return {
            "planned": planned,
            "api_queue": api_count,
            "ocr_queue": ocr_count,
            "priority_queue": priority_count,
            "theme_plan": str(theme_csv),
            "api_plan": str(api_csv),
            "api_priority_plan": str(api_priority_csv),
        }

    def _iter_manifest(self, manifest_path: Path):
        with manifest_path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            yield from reader

    def _priority_for(
        self,
        *,
        category: str,
        filename: str,
        theme: str,
        weak: bool,
        needs_ocr: bool,
        low_confidence: bool,
    ) -> str:
        if needs_ocr or weak:
            return "high"
        if category in {"Esquemas Eletricos", "Ficheiros de Engenharia"}:
            return "high"
        if theme == "Geral" and category == "Documentacao Tecnica":
            return "medium"
        if low_confidence:
            return "medium"
        return "low"
