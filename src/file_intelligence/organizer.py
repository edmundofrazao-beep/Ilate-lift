from __future__ import annotations

import shutil
import uuid
from pathlib import Path

from tqdm import tqdm

from .brands import detect_brand, slugify_folder
from .config import PipelineConfig, next_output_version
from .heuristics import normalize_category
from .jsonl import JsonlWriter
from .models import MoveLedgerEntry, utc_now_iso
from .storage import StateStore


CATEGORY_ROOTS = {
    "Documentacao Tecnica": "01. Documentacao Tecnica",
    "Esquemas Eletricos": "02. Esquemas Eletricos",
    "Ficheiros de Engenharia": "20. Ficheiros de Engenharia",
    "Normas de Seguranca": "60. Normas de Seguranca",
    "Manuais": "80. Manuais",
    "duplicates": "99. duplicates",
}

NOISE_FILENAMES = {
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini",
}


def ensure_category_roots(root: Path) -> None:
    for category_root in CATEGORY_ROOTS.values():
        (root / category_root).mkdir(parents=True, exist_ok=True)


def next_conflict_free_path(path: Path) -> Path:
    if not path.exists():
        return path
    stem = path.stem
    suffix = path.suffix
    counter = 1
    while True:
        candidate = path.with_name(f"{stem}__dup{counter}{suffix}")
        if not candidate.exists():
            return candidate
        counter += 1


def resolve_target_subpath(row, category: str) -> Path:
    brand = detect_brand(row["rel_path"], row["filename"], row["snippet"])
    brand_folder = slugify_folder(brand) if brand else "Sem_Marca"

    if row["is_duplicate"]:
        return Path(CATEGORY_ROOTS["duplicates"]) / brand_folder / row["sha1"][:2]
    return Path(CATEGORY_ROOTS[category]) / brand_folder


def is_noise_row(row) -> bool:
    source = Path(row["path"])
    if source.name in NOISE_FILENAMES:
        return True
    return "__MACOSX" in Path(row["rel_path"]).parts


class Organizer:
    def __init__(self, config: PipelineConfig, state: StateStore, writer: JsonlWriter, logger) -> None:
        self.config = config
        self.state = state
        self.writer = writer
        self.logger = logger

    def run(self) -> dict[str, int | str]:
        output_root = self._resolve_output_root()
        ensure_category_roots(output_root)
        source_prefix = f"{self.config.source_root.resolve()}/"
        rows = list(
            self.state.iter_files(
                "category IS NOT NULL AND category != '' AND path LIKE ?",
                (f"{source_prefix}%",),
            )
        )
        copied = 0
        planned = 0
        skipped_noise = 0

        for row in tqdm(rows, desc="organize", unit="file"):
            category = normalize_category(row["category"])
            if self.config.categories_filter and category not in self.config.categories_filter:
                continue
            if is_noise_row(row):
                skipped_noise += 1
                continue

            source = Path(row["path"])
            target_dir = output_root / resolve_target_subpath(row, category)
            target_dir.mkdir(parents=True, exist_ok=True)
            target = next_conflict_free_path(target_dir / source.name)

            entry = MoveLedgerEntry(
                id=str(uuid.uuid4()),
                hash=row["sha1"],
                from_path=str(source),
                to_path=str(target),
                operation_type="copy_duplicate" if row["is_duplicate"] else "copy_canonical",
                timestamp=utc_now_iso(),
            )
            if self.config.dry_run and not self.config.execute:
                self.writer.write(entry.to_dict() | {"dry_run": True, "category": category})
                planned += 1
                continue

            shutil.copy2(source, target)
            self.state.insert_move_entry(entry)
            self.writer.write(entry.to_dict() | {"dry_run": False, "category": category})
            copied += 1

        self.logger.info(
            "organize_complete output_root=%s planned=%s copied=%s skipped_noise=%s",
            output_root,
            planned,
            copied,
            skipped_noise,
        )
        return {"output_root": str(output_root), "planned": planned, "copied": copied, "skipped_noise": skipped_noise}

    def _resolve_output_root(self) -> Path:
        fixed_library = self.config.workspace_root / "organized_v7"
        if fixed_library.exists():
            return fixed_library
        return next_output_version(self.config.workspace_root)
