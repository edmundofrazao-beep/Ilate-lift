#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RUNS_DIR="$ROOT_DIR/elevator_budget_app/custom_bot_test_runs"

LATEST="$(ls -1dt "$RUNS_DIR"/* 2>/dev/null | head -n 1 || true)"
if [[ -z "$LATEST" ]]; then
  echo "Sem runs ainda."
  exit 1
fi

echo "$LATEST"
if [[ -f "$LATEST/summary.md" ]]; then
  echo
  sed -n '1,220p' "$LATEST/summary.md"
fi
