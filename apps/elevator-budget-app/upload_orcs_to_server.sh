#!/bin/zsh

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Uso: zsh elevator_budget_app/upload_orcs_to_server.sh user@server /destino/AIProjeto"
  exit 1
fi

TARGET="$1"
DEST="$2"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

rsync -av "elevator_budget_app/deploy_bundle_orcs_ilate.zip" "$TARGET:$DEST/"
rsync -av "knowledge" "$TARGET:$DEST/"
rsync -av "data/faiss_index.bin" "$TARGET:$DEST/data/"
rsync -av "data/faiss_metadata.csv" "$TARGET:$DEST/data/"
rsync -av "data/catalogs" "$TARGET:$DEST/data/"

echo "Upload concluído para $TARGET:$DEST"
