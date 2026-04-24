from __future__ import annotations

from pathlib import Path

from tqdm import tqdm

from .jsonl import JsonlWriter
from .models import DedupeRelation
from .storage import StateStore


class Deduper:
    def __init__(self, source_root: Path, state: StateStore, writer: JsonlWriter, logger) -> None:
        self.source_root = source_root.resolve()
        self.state = state
        self.writer = writer
        self.logger = logger

    def run(self) -> dict[str, int]:
        groups = self.state.iter_duplicate_groups_for_prefix(f"{self.source_root}/")
        duplicate_count = 0
        for group in tqdm(groups, desc="dedupe", unit="hash"):
            sha1 = group["sha1"]
            rows = list(self.state.iter_files("sha1 = ?", (sha1,)))
            canonical = self._choose_canonical(rows)
            for row in rows:
                relation = DedupeRelation(
                    sha1=sha1,
                    canonical_path=canonical["path"],
                    duplicate_path=row["path"],
                    duplicate_rel_path=row["rel_path"],
                    canonical_rel_path=canonical["rel_path"],
                )
                self.state.mark_dedupe(relation)
                if row["path"] != canonical["path"]:
                    duplicate_count += 1
                    self.writer.write(relation.to_dict())
        self.logger.info("dedupe_complete groups=%s duplicates=%s", len(groups), duplicate_count)
        return {"groups": len(groups), "duplicates": duplicate_count}

    def _choose_canonical(self, rows: list) -> any:
        return sorted(
            rows,
            key=lambda row: (
                len(Path(row["rel_path"]).parts),
                len(row["rel_path"]),
                row["mtime_ns"],
                row["rel_path"].lower(),
            ),
        )[0]
