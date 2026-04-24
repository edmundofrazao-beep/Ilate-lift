from __future__ import annotations

import csv
import os
import re
import shutil
import unicodedata
import uuid
from pathlib import Path

from tqdm import tqdm

from .jsonl import JsonlWriter
from .library_refiner import build_target_name, compact_whitespace, normalize_stem
from .models import MoveLedgerEntry, utc_now_iso
from .organizer import CATEGORY_ROOTS, ensure_category_roots, next_conflict_free_path
from .storage import StateStore


GENERIC_THEMES = {
    "",
    "geral",
    "general",
    "unknown",
    "desconhecido",
}

GENERIC_TITLES = {
    "",
    "unknown document",
    "unknown",
    "technical image",
    "project file",
}


def sanitize_segment(text: str, fallback: str = "Sem_Tema", max_len: int = 80) -> str:
    normalized = unicodedata.normalize("NFKC", text or "")
    normalized = normalized.replace("/", " - ")
    normalized = normalized.replace("\\", " - ")
    normalized = normalized.replace(":", " - ")
    normalized = re.sub(r"[\r\n\t]+", " ", normalized)
    normalized = compact_whitespace(normalized).strip(" .-_")
    normalized = re.sub(r"[<>\"|?*]+", "", normalized)
    normalized = normalized[:max_len].strip(" .-_")
    return normalized or fallback


def is_generic_theme(theme: str) -> bool:
    lowered = compact_whitespace(theme or "").lower()
    return lowered in GENERIC_THEMES


def is_generic_title(title: str) -> bool:
    lowered = compact_whitespace(title or "").lower()
    return lowered in GENERIC_TITLES


class SemanticLibraryBuilder:
    def __init__(
        self,
        library_root: Path,
        workspace_root: Path,
        data_dir: Path,
        state: StateStore,
        writer: JsonlWriter,
        logger,
        *,
        semantic_confidence_threshold: float = 0.55,
        heuristic_confidence_threshold: float = 0.45,
    ) -> None:
        self.library_root = library_root
        self.workspace_root = workspace_root
        self.data_dir = data_dir
        self.state = state
        self.writer = writer
        self.logger = logger
        self.semantic_confidence_threshold = semantic_confidence_threshold
        self.heuristic_confidence_threshold = heuristic_confidence_threshold

    def run(self, execute: bool) -> dict[str, int | str]:
        output_root = self._next_semantic_output_root()
        report_csv = self.data_dir / f"{output_root.name}_semantic_mapping.csv"
        semantic_results = self._load_semantic_results(self.data_dir / "organized_v5_semantic_api_results.csv")
        theme_plan = self._load_theme_plan(self.data_dir / "organized_v5_theme_plan.csv")

        files = sorted((path for path in self.library_root.rglob("*") if path.is_file()), key=lambda item: str(item))
        ensure_category_roots(output_root)

        linked = 0
        copied = 0
        planned = 0

        with report_csv.open("w", encoding="utf-8", newline="") as handle:
            report_writer = csv.writer(handle)
            report_writer.writerow(
                [
                    "source_relative_path",
                    "target_relative_path",
                    "category",
                    "brand",
                    "theme",
                    "doc_type",
                    "semantic_confidence",
                    "name_source",
                    "theme_source",
                    "link_mode",
                ]
            )

            for path in tqdm(files, desc="build-semantic-library", unit="file"):
                rel_path = path.relative_to(self.library_root).as_posix()
                parts = Path(rel_path).parts
                if len(parts) < 3:
                    continue

                category = parts[0]
                brand = parts[1]
                semantic_row = semantic_results.get(rel_path)
                theme_row = theme_plan.get(rel_path)

                theme, theme_source = self._select_theme(semantic_row, theme_row)
                target_name, name_source = self._select_filename(path, semantic_row, category)

                target_dir = output_root / category / brand
                if theme:
                    target_dir = target_dir / theme
                target_dir.mkdir(parents=True, exist_ok=True)
                target = next_conflict_free_path(target_dir / target_name)

                if not execute:
                    entry = MoveLedgerEntry(
                        id=str(uuid.uuid4()),
                        hash="",
                        from_path=str(path),
                        to_path=str(target),
                        operation_type="link_semantic_library",
                        timestamp=utc_now_iso(),
                    )
                    self.writer.write(entry.to_dict() | {"dry_run": True})
                    planned += 1
                    continue

                link_mode = self._materialize(path, target)
                entry = MoveLedgerEntry(
                    id=str(uuid.uuid4()),
                    hash="",
                    from_path=str(path),
                    to_path=str(target),
                    operation_type="link_semantic_library" if link_mode == "hardlink" else "copy_semantic_library",
                    timestamp=utc_now_iso(),
                )
                self.state.insert_move_entry(entry)
                self.writer.write(entry.to_dict() | {"dry_run": False, "link_mode": link_mode})
                if link_mode == "hardlink":
                    linked += 1
                else:
                    copied += 1

                report_writer.writerow(
                    [
                        rel_path,
                        target.relative_to(output_root).as_posix(),
                        category,
                        brand,
                        theme or "",
                        (semantic_row or {}).get("doc_type", ""),
                        (semantic_row or {}).get("confidence", ""),
                        name_source,
                        theme_source,
                        link_mode,
                    ]
                )

        self.logger.info(
            "semantic_library_build_complete source=%s output=%s planned=%s linked=%s copied=%s",
            self.library_root,
            output_root,
            planned,
            linked,
            copied,
        )
        return {
            "source_root": str(self.library_root),
            "output_root": str(output_root),
            "report_csv": str(report_csv),
            "planned": planned,
            "linked": linked,
            "copied": copied,
        }

    def _next_semantic_output_root(self) -> Path:
        index = 1
        while True:
            candidate = self.workspace_root / f"organized_v{index}"
            if not candidate.exists():
                return candidate
            index += 1

    def _load_semantic_results(self, path: Path) -> dict[str, dict[str, str]]:
        if not path.exists():
            return {}
        with path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            return {row["relative_path"]: row for row in reader if row.get("relative_path")}

    def _load_theme_plan(self, path: Path) -> dict[str, dict[str, str]]:
        if not path.exists():
            return {}
        with path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            return {row["relative_path"]: row for row in reader if row.get("relative_path")}

    def _select_theme(
        self,
        semantic_row: dict[str, str] | None,
        theme_row: dict[str, str] | None,
    ) -> tuple[str | None, str]:
        if semantic_row:
            try:
                semantic_conf = float(semantic_row.get("confidence") or 0)
            except ValueError:
                semantic_conf = 0.0
            semantic_theme = sanitize_segment(semantic_row.get("theme", ""), fallback="")
            if semantic_conf >= self.semantic_confidence_threshold and semantic_theme and not is_generic_theme(semantic_theme):
                return semantic_theme, "semantic_api"

        if theme_row:
            try:
                heuristic_conf = float(theme_row.get("confidence") or 0)
            except ValueError:
                heuristic_conf = 0.0
            heuristic_theme = sanitize_segment(theme_row.get("theme", ""), fallback="")
            if heuristic_conf >= self.heuristic_confidence_threshold and heuristic_theme and not is_generic_theme(heuristic_theme):
                return heuristic_theme, "theme_plan"

        return None, "brand_root"

    def _select_filename(self, path: Path, semantic_row: dict[str, str] | None, category: str) -> tuple[str, str]:
        suffix = path.suffix.lower()
        if semantic_row:
            try:
                semantic_conf = float(semantic_row.get("confidence") or 0)
            except ValueError:
                semantic_conf = 0.0
            title = semantic_row.get("suggested_title", "")
            if semantic_conf >= self.semantic_confidence_threshold and title and not is_generic_title(title):
                cleaned = sanitize_segment(normalize_stem(title), fallback=path.stem, max_len=120)
                if not cleaned.lower().endswith(suffix):
                    return f"{cleaned}{suffix}", "semantic_title"

        return build_target_name(path, self.library_root), "fallback_refiner"

    def _materialize(self, source: Path, target: Path) -> str:
        try:
            os.link(source, target)
            return "hardlink"
        except OSError:
            shutil.copy2(source, target)
            return "copy"
