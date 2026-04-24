from __future__ import annotations

import re
import unicodedata
import uuid
from pathlib import Path

from tqdm import tqdm

from .brands import slugify_folder
from .jsonl import JsonlWriter
from .models import MoveLedgerEntry, utc_now_iso
from .organizer import next_conflict_free_path
from .storage import StateStore


NOISE_FILENAMES = {
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini",
}

GENERIC_STEMS = {
    "cover",
    "metadata",
    "readme",
    "store",
    "manual",
    "document",
    "file",
    "image",
    "img",
    "scan",
}

CATEGORY_LABELS = {
    "Documentacao Tecnica": "Doc Tecnica",
    "Manuais": "Manual",
    "Esquemas Eletricos": "Esquema",
    "Normas de Seguranca": "Norma",
    "Ficheiros de Engenharia": "Engenharia",
    "duplicates": "Duplicado",
}


def compact_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def normalize_stem(stem: str) -> str:
    text = unicodedata.normalize("NFKC", stem)
    text = text.replace("_", " ")
    text = text.replace("[", " ")
    text = text.replace("]", " ")
    text = text.replace("(", " ")
    text = text.replace(")", " ")
    text = text.replace("{", " ")
    text = text.replace("}", " ")
    text = text.replace("&", " and ")
    text = text.replace("—", "-")
    text = text.replace("–", "-")
    text = re.sub(r"__dup\d+$", "", text, flags=re.I)
    text = re.sub(r"\bcopy\b", "", text, flags=re.I)
    text = re.sub(r"\bfinal\b", "", text, flags=re.I)
    text = re.sub(r"\bdraft\b", "", text, flags=re.I)
    text = re.sub(r"[^0-9A-Za-zÀ-ÿ.\-+ ]+", " ", text)
    text = re.sub(r"\s*\.\s*", " ", text)
    text = re.sub(r"\s*-\s*", " - ", text)
    text = compact_whitespace(text)
    text = text.strip(" .-_")
    return text


def is_generic_stem(stem: str) -> bool:
    normalized = normalize_stem(stem).lower()
    bare = re.sub(r"[^a-z0-9]+", "", normalized)
    if not bare:
        return True
    if bare.isdigit() and len(bare) <= 3:
        return True
    if len(bare) <= 3:
        return True
    return normalized in GENERIC_STEMS


def build_target_name(path: Path, root: Path) -> str:
    rel_parts = path.relative_to(root).parts
    if len(rel_parts) < 3:
        return path.name

    category = rel_parts[0]
    brand = rel_parts[1]
    stem = path.stem
    suffix = path.suffix.lower()
    cleaned = normalize_stem(stem)
    category_label = CATEGORY_LABELS.get(category, category)

    brand_token = brand.replace("_", " ").strip()
    if is_generic_stem(stem):
        cleaned = f"{brand_token} - {category_label}"
    elif brand_token and brand_token.lower() not in cleaned.lower():
        cleaned = f"{brand_token} - {cleaned}"

    cleaned = compact_whitespace(cleaned)
    cleaned = re.sub(r"\s+-\s+-\s+", " - ", cleaned)
    cleaned = cleaned.strip(" .-_")
    if not cleaned:
        cleaned = f"{brand_token} - {category_label}".strip(" -")
    return f"{cleaned}{suffix}"


class LibraryRefiner:
    def __init__(self, root: Path, state: StateStore, writer: JsonlWriter, logger) -> None:
        self.root = root
        self.state = state
        self.writer = writer
        self.logger = logger

    def run(self, execute: bool) -> dict[str, int | str]:
        files = sorted((path for path in self.root.rglob("*") if path.is_file()), key=lambda item: str(item))
        renamed = 0
        removed_noise = 0
        planned = 0

        for path in tqdm(files, desc="refine-library", unit="file"):
            if path.name in NOISE_FILENAMES or "__MACOSX" in path.parts:
                entry = MoveLedgerEntry(
                    id=str(uuid.uuid4()),
                    hash="",
                    from_path=str(path),
                    to_path="",
                    operation_type="delete_noise",
                    timestamp=utc_now_iso(),
                )
                if not execute:
                    self.writer.write(entry.to_dict() | {"dry_run": True})
                    planned += 1
                    continue
                if path.exists():
                    path.unlink()
                    self._prune_empty_parents(path.parent)
                    self.state.insert_move_entry(entry)
                    self.writer.write(entry.to_dict() | {"dry_run": False})
                    removed_noise += 1
                continue

            target_name = build_target_name(path, self.root)
            if target_name == path.name:
                continue

            target = next_conflict_free_path(path.with_name(target_name))
            entry = MoveLedgerEntry(
                id=str(uuid.uuid4()),
                hash="",
                from_path=str(path),
                to_path=str(target),
                operation_type="rename_in_place",
                timestamp=utc_now_iso(),
            )
            if not execute:
                self.writer.write(entry.to_dict() | {"dry_run": True})
                planned += 1
                continue

            path.rename(target)
            self.state.insert_move_entry(entry)
            self.writer.write(entry.to_dict() | {"dry_run": False})
            renamed += 1

        self.logger.info(
            "library_refine_complete root=%s planned=%s renamed=%s removed_noise=%s",
            self.root,
            planned,
            renamed,
            removed_noise,
        )
        return {
            "root": str(self.root),
            "planned": planned,
            "renamed": renamed,
            "removed_noise": removed_noise,
        }

    def _prune_empty_parents(self, path: Path) -> None:
        current = path
        while current.exists() and current.is_dir() and current != self.root:
            try:
                current.rmdir()
            except OSError:
                break
            current = current.parent
