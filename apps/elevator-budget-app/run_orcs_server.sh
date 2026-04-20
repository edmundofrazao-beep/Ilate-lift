#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$ROOT_DIR/elevator_budget_app"
PORT="${PORT:-8501}"
HOST="${HOST:-0.0.0.0}"

cd "$ROOT_DIR"

exec python3 -m streamlit run "$APP_DIR/app.py" \
  --server.address "$HOST" \
  --server.port "$PORT" \
  --server.headless true
