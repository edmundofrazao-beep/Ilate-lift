#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RUNS_DIR="$ROOT_DIR/elevator_budget_app/legal_bot_test_runs"

LATEST="$(find "$RUNS_DIR" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort | tail -n 1)"

if [[ -z "${LATEST:-}" ]]; then
  echo "No legal bot test runs found."
  exit 1
fi

echo "$LATEST/summary.md"
