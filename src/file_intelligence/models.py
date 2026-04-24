from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass(slots=True)
class FileRecord:
    path: str
    rel_path: str
    filename: str
    extension: str
    size: int
    mtime_ns: int
    sha1: str
    snippet: str
    snippet_source: str
    scan_timestamp: str = field(default_factory=utc_now_iso)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class ClassificationDecision:
    path: str
    rel_path: str
    sha1: str
    category: str
    confidence: float
    stage: str
    rationale: str
    heuristic_override: bool = False
    family_hint: str | None = None
    classified_at: str = field(default_factory=utc_now_iso)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class DedupeRelation:
    sha1: str
    canonical_path: str
    duplicate_path: str
    duplicate_rel_path: str
    canonical_rel_path: str
    decided_at: str = field(default_factory=utc_now_iso)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class ClusterSuggestion:
    cluster_id: str
    cluster_name: str
    category: str
    suggested_subpath: str
    member_paths: list[str]
    generated_at: str = field(default_factory=utc_now_iso)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class MoveLedgerEntry:
    id: str
    hash: str
    from_path: str
    to_path: str
    operation_type: str
    timestamp: str = field(default_factory=utc_now_iso)
    rolled_back_at: str | None = None

    def to_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["from"] = payload.pop("from_path")
        payload["to"] = payload.pop("to_path")
        return payload


@dataclass(slots=True)
class PipelinePaths:
    workspace_root: Path
    source_root: Path
    state_dir: Path
    cache_dir: Path
    logs_dir: Path
    data_dir: Path

