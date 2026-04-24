from __future__ import annotations

from pathlib import Path

from tqdm import tqdm

from .models import utc_now_iso
from .storage import StateStore


class RollbackEngine:
    def __init__(self, state: StateStore, logger) -> None:
        self.state = state
        self.logger = logger

    def run(self, execute: bool) -> dict[str, int]:
        rows = self.state.iter_unrolled_moves_reverse()
        removed = 0
        moved_back = 0
        planned = 0
        for row in tqdm(rows, desc="rollback", unit="move"):
            target = Path(row["to_path"])
            if not execute:
                planned += 1
                continue
            if row["operation_type"] in {
                "copy_duplicate",
                "copy_canonical",
                "copy_semantic_library",
                "link_semantic_library",
                "link_schematics_library",
            }:
                if target.exists() and target.is_file():
                    target.unlink()
                    self._prune_empty_parents(target.parent)
                    removed += 1
            elif row["operation_type"] == "rename_in_place":
                origin = Path(row["from_path"])
                if target.exists() and target.is_file():
                    origin.parent.mkdir(parents=True, exist_ok=True)
                    target.rename(origin)
                    moved_back += 1
            elif row["operation_type"] == "delete_noise":
                pass
            self.state.mark_move_rolled_back(row["id"], utc_now_iso())
        self.logger.info("rollback_complete planned=%s removed=%s moved_back=%s", planned, removed, moved_back)
        return {"planned": planned, "removed": removed, "moved_back": moved_back}

    def _prune_empty_parents(self, path: Path) -> None:
        current = path
        while current.exists() and current.is_dir():
            try:
                current.rmdir()
            except OSError:
                break
            current = current.parent
