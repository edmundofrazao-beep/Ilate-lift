from __future__ import annotations

import csv
import os
import shutil
import uuid
from collections import Counter
from pathlib import Path

from tqdm import tqdm

from .jsonl import JsonlWriter
from .models import MoveLedgerEntry, utc_now_iso
from .organizer import next_conflict_free_path
from .storage import StateStore


HIGH_SIGNAL_TERMS = (
    "wiring diagram",
    "electrical schematic",
    "electrical schematics",
    "circuit diagram",
    "circuit diagrams",
    "electrical drawing",
    "electrical drawings",
    "wiring",
    "schematic",
    "schematics",
    "power supply circuit",
    "connector diagram",
    "pinout",
    "terminal diagram",
    "field wiring",
    "wiring instructions",
)

MEDIUM_SIGNAL_TERMS = (
    "electrical",
    "diagram",
    "circuit",
    "connection",
    "interface",
    "io connector",
    "signal input",
    "control panel wiring",
    "controller wiring",
    "drawings",
    "drawings.pdf",
    "wiring and noise",
    "installation schematics",
)

LOW_SIGNAL_TERMS = (
    "telephone line",
    "user interface",
    "operator interface",
    "board",
    "controller",
    "inspection photo",
    "technical photo",
)

EXCLUDED_SUFFIXES = {
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".api",
    ".aup",
    ".mp3",
    ".au",
    ".nxe",
    ".zip",
}


class SchematicsExtractor:
    def __init__(
        self,
        library_root: Path,
        workspace_root: Path,
        data_dir: Path,
        state: StateStore,
        writer: JsonlWriter,
        logger,
    ) -> None:
        self.library_root = library_root
        self.workspace_root = workspace_root
        self.data_dir = data_dir
        self.state = state
        self.writer = writer
        self.logger = logger

    def run(self, execute: bool) -> dict[str, int | str]:
        semantic_results = self._load_csv(self.data_dir / "organized_v5_semantic_api_results.csv", "relative_path")
        mapping_rows = self._load_csv(self.data_dir / "organized_v7_semantic_mapping.csv", "source_relative_path")

        output_root = self._next_output_root()
        report_csv = self.data_dir / f"{output_root.name}_report.csv"
        high_count = 0
        review_count = 0
        linked = 0
        copied = 0
        planned = 0

        with report_csv.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.writer(handle)
            writer.writerow(
                [
                    "source_relative_path",
                    "target_relative_path",
                    "bucket",
                    "brand",
                    "score",
                    "doc_type",
                    "theme",
                    "suggested_title",
                    "rationale",
                ]
            )

            for source_rel, mapping in tqdm(sorted(mapping_rows.items()), desc="extract-schematics", unit="file"):
                semantic_row = semantic_results.get(source_rel, {})
                score, rationale = self._score_candidate(source_rel, mapping, semantic_row)
                if score < 4:
                    continue

                bucket = "high_confidence" if score >= 7 else "review"
                target_rel = Path(mapping["target_relative_path"])
                source = self.library_root / target_rel
                if not source.exists():
                    continue

                brand = target_rel.parts[1] if len(target_rel.parts) >= 2 else "Sem_Marca"
                target_dir = output_root / bucket / brand
                target_dir.mkdir(parents=True, exist_ok=True)
                target = next_conflict_free_path(target_dir / source.name)

                entry = MoveLedgerEntry(
                    id=str(uuid.uuid4()),
                    hash="",
                    from_path=str(source),
                    to_path=str(target),
                    operation_type="link_schematics_library",
                    timestamp=utc_now_iso(),
                )

                if not execute:
                    self.writer.write(entry.to_dict() | {"dry_run": True, "bucket": bucket, "score": score})
                    planned += 1
                else:
                    link_mode = self._materialize(source, target)
                    self.state.insert_move_entry(entry)
                    self.writer.write(
                        entry.to_dict() | {"dry_run": False, "bucket": bucket, "score": score, "link_mode": link_mode}
                    )
                    if link_mode == "hardlink":
                        linked += 1
                    else:
                        copied += 1

                writer.writerow(
                    [
                        source_rel,
                        target.relative_to(output_root).as_posix(),
                        bucket,
                        brand,
                        score,
                        semantic_row.get("doc_type", ""),
                        semantic_row.get("theme", ""),
                        semantic_row.get("suggested_title", ""),
                        rationale,
                    ]
                )

                if bucket == "high_confidence":
                    high_count += 1
                else:
                    review_count += 1

        summary = {
            "output_root": str(output_root),
            "report_csv": str(report_csv),
            "high_confidence": high_count,
            "review": review_count,
            "planned": planned,
            "linked": linked,
            "copied": copied,
        }
        self.logger.info("schematics_extract_complete %s", summary)
        return summary

    def _load_csv(self, path: Path, key: str) -> dict[str, dict[str, str]]:
        if not path.exists():
            return {}
        with path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            return {row[key]: row for row in reader if row.get(key)}

    def _next_output_root(self) -> Path:
        index = 1
        while True:
            candidate = self.workspace_root / f"electrical_schematics_v{index}"
            if not candidate.exists():
                return candidate
            index += 1

    def _score_candidate(
        self,
        source_rel: str,
        mapping_row: dict[str, str],
        semantic_row: dict[str, str],
    ) -> tuple[int, str]:
        tokens = " | ".join(
            [
                source_rel,
                mapping_row.get("target_relative_path", ""),
                semantic_row.get("category", ""),
                semantic_row.get("doc_type", ""),
                semantic_row.get("theme", ""),
                semantic_row.get("suggested_title", ""),
                semantic_row.get("reason", ""),
            ]
        ).lower()
        source_path = Path(source_rel)
        source_category = source_path.parts[0] if len(source_path.parts) >= 1 else ""
        suffix = source_path.suffix.lower()

        if suffix in EXCLUDED_SUFFIXES:
            return 0, "excluded_suffix"

        if source_category == "duplicates":
            return 0, "skip_duplicates"

        score = 0
        reasons: list[str] = []

        category = semantic_row.get("category", "")
        doc_type = semantic_row.get("doc_type", "").lower()
        if source_category == "Esquemas Eletricos" or category == "Esquemas Eletricos":
            score += 8
            reasons.append("source_category=Esquemas_Eletricos")
        if doc_type == "wiring diagram":
            score += 8
            reasons.append("doc_type=Wiring_Diagram")

        high_hits = [term for term in HIGH_SIGNAL_TERMS if term in tokens]
        medium_hits = [term for term in MEDIUM_SIGNAL_TERMS if term in tokens]
        low_hits = [term for term in LOW_SIGNAL_TERMS if term in tokens]

        if high_hits:
            score += min(6, 2 * len(high_hits))
            reasons.append("high=" + ",".join(high_hits[:4]))
        if medium_hits:
            score += min(4, len(medium_hits))
            reasons.append("medium=" + ",".join(medium_hits[:4]))
        if low_hits and not high_hits:
            score -= 1
            reasons.append("low=" + ",".join(low_hits[:3]))

        if suffix in {".pdf", ".jpg", ".jpeg", ".png", ".gif", ".tif", ".tiff"}:
            score += 1
            reasons.append("doc_suffix")

        if source_category == "Esquemas Eletricos" and score < 7:
            score = 7
            reasons.append("promote_existing_schematics")

        score = max(score, 0)
        return score, "; ".join(reasons)

    def _materialize(self, source: Path, target: Path) -> str:
        try:
            os.link(source, target)
            return "hardlink"
        except OSError:
            shutil.copy2(source, target)
            return "copy"
