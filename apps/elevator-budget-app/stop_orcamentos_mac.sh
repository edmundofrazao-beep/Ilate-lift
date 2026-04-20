#!/bin/zsh

set -euo pipefail

ROOT_DIR="/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/-- ILATE  --/AIProjeto"
LOG_DIR="$ROOT_DIR/elevator_budget_app/.launcher"

for PID_FILE in "$LOG_DIR/streamlit.pid" "$LOG_DIR/supervisor.pid"; do
  if [[ -f "$PID_FILE" ]]; then
    PID="$(cat "$PID_FILE" 2>/dev/null || true)"
    if [[ -n "${PID:-}" ]] && kill -0 "$PID" 2>/dev/null; then
      kill "$PID" 2>/dev/null || true
    fi
    rm -f "$PID_FILE"
  fi
done
