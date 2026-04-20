from __future__ import annotations

import json
import os
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    ROOT / "elevator_budget_app" / "app.py",
    ROOT / "elevator_budget_app" / "assistant.py",
    ROOT / "elevator_budget_app" / "requirements.txt",
    ROOT / "elevator_budget_app" / "deploy_bundle_orcs_ilate.zip",
    ROOT / "knowledge",
    ROOT / "data" / "faiss_index.bin",
    ROOT / "data" / "faiss_metadata.csv",
    ROOT / "data" / "catalogs",
]


def main() -> int:
    env_path = ROOT / ".env"
    env_text = env_path.read_text(encoding="utf-8") if env_path.exists() else ""
    api_present = bool(os.getenv("OPENAI_API_KEY")) or "OPENAI_API_KEY=" in env_text

    checks = []
    for path in REQUIRED_FILES:
        checks.append(
            {
                "path": str(path),
                "exists": path.exists(),
                "type": "dir" if path.is_dir() else "file",
                "size_bytes": path.stat().st_size if path.exists() and path.is_file() else None,
            }
        )

    payload = {
        "root": str(ROOT),
        "env_file_present": env_path.exists(),
        "openai_api_key_present": api_present,
        "checks": checks,
        "ok": api_present and all(item["exists"] for item in checks),
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0 if payload["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
