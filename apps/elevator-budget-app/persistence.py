from __future__ import annotations

import json
from datetime import datetime
from hashlib import sha256
from pathlib import Path
from typing import Any

from elevator_budget_app.config import AUTOSAVE_DIR, AUTOSAVE_FILE


def _serialise(payload: dict[str, Any]) -> str:
    return json.dumps(payload, ensure_ascii=True, sort_keys=True, default=str)


def snapshot_hash(payload: dict[str, Any]) -> str:
    return sha256(_serialise(payload).encode("utf-8")).hexdigest()


def load_autosave() -> dict[str, Any] | None:
    if not AUTOSAVE_FILE.exists():
        return None
    return json.loads(AUTOSAVE_FILE.read_text(encoding="utf-8"))


def save_autosave(payload: dict[str, Any]) -> str:
    AUTOSAVE_DIR.mkdir(parents=True, exist_ok=True)
    wrapped = {
        "saved_at": datetime.now().isoformat(timespec="seconds"),
        "payload": payload,
        "hash": snapshot_hash(payload),
    }
    AUTOSAVE_FILE.write_text(_serialise(wrapped), encoding="utf-8")
    return wrapped["saved_at"]


def autosave_exists() -> bool:
    return Path(AUTOSAVE_FILE).exists()
