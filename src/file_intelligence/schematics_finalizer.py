from __future__ import annotations

import csv
import os
import shutil
import uuid
from pathlib import Path

from tqdm import tqdm

from .jsonl import JsonlWriter
from .models import MoveLedgerEntry, utc_now_iso
from .organizer import next_conflict_free_path
from .storage import StateStore


NOISE_FILENAMES = {".DS_Store", "Thumbs.db", "desktop.ini"}


class SchematicsFinalizer:
    def __init__(self, source_root: Path, workspace_root: Path, state: StateStore, writer: JsonlWriter, logger) -> None:
        self.source_root = source_root
        self.workspace_root = workspace_root
        self.state = state
        self.writer = writer
        self.logger = logger

    def run(self, execute: bool) -> dict[str, int | str]:
        high_root = self.source_root / "high_confidence"
        review_root = self.source_root / "review"
        final_root = self._next_root("electrical_schematics_final_v")
        eng_root = self._next_root("engineering_residual_v")
        final_report = self.workspace_root / "data" / f"{final_root.name}_report.csv"
        engineering_report = self.workspace_root / "data" / f"{eng_root.name}_report.csv"

        promoted = 0
        engineering = 0
        skipped_noise = 0
        linked = 0
        copied = 0
        planned = 0

        with (
            final_report.open("w", encoding="utf-8", newline="") as final_handle,
            engineering_report.open("w", encoding="utf-8", newline="") as eng_handle,
        ):
            final_writer = csv.writer(final_handle)
            eng_writer = csv.writer(eng_handle)
            final_writer.writerow(["source_path", "target_path", "brand", "bucket"])
            eng_writer.writerow(["source_path", "target_path", "brand", "bucket"])

            if high_root.exists():
                for source in tqdm(sorted(p for p in high_root.rglob("*") if p.is_file()), desc="finalize-high", unit="file"):
                    if source.name in NOISE_FILENAMES:
                        skipped_noise += 1
                        continue
                    brand = source.parent.name
                    target_dir = final_root / brand
                    target_dir.mkdir(parents=True, exist_ok=True)
                    target = next_conflict_free_path(target_dir / source.name)
                    planned, linked, copied = self._materialize(
                        source, target, execute, planned, linked, copied, operation_type="link_schematics_final"
                    )
                    if execute:
                        final_writer.writerow([str(source), str(target), brand, "high_confidence"])
                        promoted += 1

            if review_root.exists():
                for source in tqdm(sorted(p for p in review_root.rglob("*") if p.is_file()), desc="finalize-review", unit="file"):
                    if source.name in NOISE_FILENAMES:
                        skipped_noise += 1
                        continue
                    brand = source.parent.name
                    target_dir = eng_root / brand
                    target_dir.mkdir(parents=True, exist_ok=True)
                    target = next_conflict_free_path(target_dir / source.name)
                    planned, linked, copied = self._materialize(
                        source, target, execute, planned, linked, copied, operation_type="link_engineering_residual"
                    )
                    if execute:
                        eng_writer.writerow([str(source), str(target), brand, "review"])
                        engineering += 1

        summary = {
            "schematics_final_root": str(final_root),
            "engineering_residual_root": str(eng_root),
            "schematics_report_csv": str(final_report),
            "engineering_report_csv": str(engineering_report),
            "promoted": promoted,
            "engineering": engineering,
            "skipped_noise": skipped_noise,
            "planned": planned,
            "linked": linked,
            "copied": copied,
        }
        self.logger.info("schematics_finalize_complete %s", summary)
        return summary

    def _next_root(self, prefix: str) -> Path:
        index = 1
        while True:
            candidate = self.workspace_root / f"{prefix}{index}"
            if not candidate.exists():
                return candidate
            index += 1

    def _materialize(
        self,
        source: Path,
        target: Path,
        execute: bool,
        planned: int,
        linked: int,
        copied: int,
        *,
        operation_type: str,
    ) -> tuple[int, int, int]:
        entry = MoveLedgerEntry(
            id=str(uuid.uuid4()),
            hash="",
            from_path=str(source),
            to_path=str(target),
            operation_type=operation_type,
            timestamp=utc_now_iso(),
        )
        if not execute:
            self.writer.write(entry.to_dict() | {"dry_run": True})
            return planned + 1, linked, copied

        try:
            os.link(source, target)
            link_mode = "hardlink"
            linked += 1
        except OSError:
            shutil.copy2(source, target)
            link_mode = "copy"
            copied += 1

        self.state.insert_move_entry(entry)
        self.writer.write(entry.to_dict() | {"dry_run": False, "link_mode": link_mode})
        return planned, linked, copied
