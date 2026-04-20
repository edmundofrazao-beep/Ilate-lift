#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$ROOT_DIR/elevator_budget_app"
OUT_DIR="$APP_DIR/deploy_bundle"
ZIP_PATH="$APP_DIR/deploy_bundle_orcs_ilate.zip"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/elevator_budget_app" "$OUT_DIR/03_runtime_tools" "$OUT_DIR/ilate"

cp "$APP_DIR/app.py" "$OUT_DIR/elevator_budget_app/"
cp "$APP_DIR/assistant.py" "$OUT_DIR/elevator_budget_app/"
cp "$APP_DIR/styles.css" "$OUT_DIR/elevator_budget_app/"
cp "$APP_DIR/requirements.txt" "$OUT_DIR/elevator_budget_app/"
cp "$APP_DIR/README.md" "$OUT_DIR/elevator_budget_app/"
cp "$APP_DIR/DEPLOY_SERVER.md" "$OUT_DIR/elevator_budget_app/"
cp "$APP_DIR/run_orcs_server.sh" "$OUT_DIR/elevator_budget_app/"
cp "$APP_DIR/.env.example" "$OUT_DIR/elevator_budget_app/"

cp "$ROOT_DIR/03_runtime_tools/env_loader.py" "$OUT_DIR/03_runtime_tools/"
cp "$ROOT_DIR/03_runtime_tools/ilate_copilot.py" "$OUT_DIR/03_runtime_tools/"
cp "$ROOT_DIR/03_runtime_tools/ilate_bot.py" "$OUT_DIR/03_runtime_tools/"

cp -R "$ROOT_DIR/ilate/core" "$OUT_DIR/ilate/"

cat > "$OUT_DIR/DEPLOY_CONTENTS.md" <<'EOF'
# Deploy Contents

Este bundle inclui:

- app ORCS fundida com ILATE Assistente
- motor de consulta ILATE necessário para runtime
- núcleo `ilate/core`

Não inclui os artefactos pesados. Estes têm de existir no servidor:

- `knowledge/`
- `data/faiss_index.bin`
- `data/faiss_metadata.csv`
- `data/catalogs/`
EOF

cd "$APP_DIR"
rm -f "$ZIP_PATH"
zip -r "$ZIP_PATH" "deploy_bundle" >/dev/null
echo "$ZIP_PATH"
