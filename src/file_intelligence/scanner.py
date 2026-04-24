from __future__ import annotations

from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path
from typing import Iterable

from tqdm import tqdm

from .config import PipelineConfig
from .extractors import extract_text_snippet, sha1_for_file
from .jsonl import JsonlWriter
from .models import FileRecord
from .storage import StateStore


def _scan_one(path_str: str, source_root: str, snippet_chars: int, hash_chunk_size: int) -> dict:
    path = Path(path_str)
    stat = path.stat()
    sha1 = sha1_for_file(path, hash_chunk_size)
    snippet, snippet_source = extract_text_snippet(path, snippet_chars)
    return {
        "path": str(path.resolve()),
        "rel_path": str(path.resolve().relative_to(Path(source_root).resolve())),
        "filename": path.name,
        "extension": path.suffix.lower(),
        "size": stat.st_size,
        "mtime_ns": stat.st_mtime_ns,
        "sha1": sha1,
        "snippet": snippet,
        "snippet_source": snippet_source,
    }


def iter_source_files(root: Path) -> Iterable[Path]:
    for path in root.rglob("*"):
        if path.is_file():
            yield path


class Scanner:
    def __init__(self, config: PipelineConfig, state: StateStore, writer: JsonlWriter, logger) -> None:
        self.config = config
        self.state = state
        self.writer = writer
        self.logger = logger

    def run(self) -> dict[str, int]:
        source_root = self.config.source_root.resolve()
        files = list(iter_source_files(source_root))
        processed = 0
        skipped = 0
        failed = 0

        with ProcessPoolExecutor(max_workers=self.config.workers) as executor:
            futures = {}
            for path in files:
                resolved = str(path.resolve())
                existing = self.state.get_existing_file(resolved)
                stat = path.stat()
                if self.config.resume and existing and existing["mtime_ns"] == stat.st_mtime_ns and existing["size"] == stat.st_size:
                    skipped += 1
                    continue
                futures[
                    executor.submit(
                        _scan_one,
                        resolved,
                        str(source_root),
                        self.config.snippet_chars,
                        self.config.hash_chunk_size,
                    )
                ] = resolved

            for future in tqdm(as_completed(futures), total=len(futures), desc="scan", unit="file"):
                path = futures[future]
                try:
                    payload = future.result()
                    record = FileRecord(**payload)
                    self.state.upsert_file(record)
                    self.writer.write(record.to_dict())
                    processed += 1
                except Exception as exc:  # pragma: no cover
                    failed += 1
                    self.logger.exception("scan_failed path=%s error=%s", path, exc)

        self.logger.info("scan_complete processed=%s skipped=%s failed=%s total=%s", processed, skipped, failed, len(files))
        return {"processed": processed, "skipped": skipped, "failed": failed, "total": len(files)}
