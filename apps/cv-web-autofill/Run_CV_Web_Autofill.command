#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_PY="$SCRIPT_DIR/.venv/bin/python3"
PORT="${CV_WEB_AUTOFILL_PORT:-8511}"

cd "$SCRIPT_DIR"

if [ ! -x "$VENV_PY" ]; then
  /usr/bin/python3 -m venv "$SCRIPT_DIR/.venv"
fi

"$SCRIPT_DIR/.venv/bin/pip" install -r "$SCRIPT_DIR/requirements.txt" >/tmp/cv_web_autofill_install.log 2>&1 || {
  echo "Falha a instalar dependências. Ver /tmp/cv_web_autofill_install.log"
  exit 1
}

if command -v open >/dev/null 2>&1; then
  (sleep 2; open "http://localhost:${PORT}") &
fi

exec "$VENV_PY" -m streamlit run "$SCRIPT_DIR/app.py" --server.port "$PORT" --server.headless true
