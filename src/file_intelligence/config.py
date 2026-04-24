from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from .models import PipelinePaths


@dataclass(slots=True)
class PipelineConfig:
    workspace_root: Path
    source_root: Path
    dry_run: bool = True
    execute: bool = False
    resume: bool = False
    workers: int = max((os.cpu_count() or 4) - 1, 1)
    snippet_chars: int = 1000
    hash_chunk_size: int = 1024 * 1024
    stage1_model: str = "gpt-5.4-nano"
    stage2_model: str = "gpt-5.4-mini"
    stage1_batch_size: int = 8
    stage2_batch_size: int = 4
    low_confidence_threshold: float = 0.72
    classification_limit: int | None = None
    categories_filter: tuple[str, ...] = ()

    @property
    def paths(self) -> PipelinePaths:
        workspace_root = self.workspace_root.resolve()
        return PipelinePaths(
            workspace_root=workspace_root,
            source_root=self.source_root.resolve(),
            state_dir=workspace_root / "state",
            cache_dir=workspace_root / "cache",
            logs_dir=workspace_root / "logs",
            data_dir=workspace_root / "data",
        )


def ensure_workspace_dirs(paths: PipelinePaths) -> None:
    paths.workspace_root.mkdir(parents=True, exist_ok=True)
    paths.source_root.mkdir(parents=True, exist_ok=True)
    paths.state_dir.mkdir(parents=True, exist_ok=True)
    paths.cache_dir.mkdir(parents=True, exist_ok=True)
    paths.logs_dir.mkdir(parents=True, exist_ok=True)
    paths.data_dir.mkdir(parents=True, exist_ok=True)


def next_output_version(workspace_root: Path) -> Path:
    index = 1
    while True:
        candidate = workspace_root / f"organized_v{index}"
        if not candidate.exists():
            return candidate
        index += 1
