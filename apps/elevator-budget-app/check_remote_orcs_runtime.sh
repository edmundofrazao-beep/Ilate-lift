#!/bin/zsh

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Uso: zsh elevator_budget_app/check_remote_orcs_runtime.sh user@server /destino/AIProjeto"
  exit 1
fi

TARGET="$1"
DEST="$2"

ssh "$TARGET" "
  python3 - <<'PY'
import json
from pathlib import Path

root = Path('$DEST')
env_path = root / '.env'
env_text = env_path.read_text(encoding='utf-8') if env_path.exists() else ''

checks = []
for path in [
    root / 'elevator_budget_app' / 'app.py',
    root / 'elevator_budget_app' / 'assistant.py',
    root / 'elevator_budget_app' / 'requirements.txt',
    root / 'knowledge',
    root / 'data' / 'faiss_index.bin',
    root / 'data' / 'faiss_metadata.csv',
    root / 'data' / 'catalogs',
]:
    checks.append({
        'path': str(path),
        'exists': path.exists(),
        'type': 'dir' if path.is_dir() else 'file',
    })

payload = {
    'root': str(root),
    'env_file_present': env_path.exists(),
    'openai_api_key_declared': 'OPENAI_API_KEY=' in env_text,
    'checks': checks,
    'ok': env_path.exists() and ('OPENAI_API_KEY=' in env_text) and all(item['exists'] for item in checks),
}
print(json.dumps(payload, ensure_ascii=False, indent=2))
PY
"
