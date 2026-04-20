#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RUNS_DIR="$ROOT_DIR/elevator_budget_app/orcs_debug_runs"

if [[ ! -d "$RUNS_DIR" ]]; then
  echo "Sem runs ORCS debug."
  exit 1
fi

LATEST="$(find "$RUNS_DIR" -mindepth 1 -maxdepth 1 -type d | sort | tail -n 1)"

if [[ -z "$LATEST" ]]; then
  echo "Sem runs ORCS debug."
  exit 1
fi

echo "$LATEST"
if [[ -f "$LATEST/summary.md" ]]; then
  echo
  sed -n '1,220p' "$LATEST/summary.md"
fi
