#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_PATH="$ROOT_DIR/elevator_budget_app/orcs_artifacts_bundle.tar.gz"

cd "$ROOT_DIR"

tar -czf "$OUT_PATH" \
  knowledge \
  data/faiss_index.bin \
  data/faiss_metadata.csv \
  data/catalogs

echo "$OUT_PATH"
