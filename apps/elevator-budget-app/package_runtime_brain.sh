#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

OUT="orcs_runtime_brain_bundle.tar.gz"

rm -f "$OUT"

tar -czf "$OUT" \
  .env.example \
  elevator_budget_app \
  03_runtime_tools \
  knowledge \
  data

echo "$OUT"
