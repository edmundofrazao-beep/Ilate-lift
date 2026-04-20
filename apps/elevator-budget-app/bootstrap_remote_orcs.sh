#!/bin/zsh

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Uso: zsh elevator_budget_app/bootstrap_remote_orcs.sh user@server /destino/AIProjeto"
  exit 1
fi

TARGET="$1"
DEST="$2"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

zsh elevator_budget_app/preflight_orcs_deploy.sh
zsh elevator_budget_app/upload_orcs_to_server.sh "$TARGET" "$DEST"

ssh "$TARGET" "
  set -e
  mkdir -p '$DEST/data' '$DEST/elevator_budget_app' '$DEST/03_runtime_tools' '$DEST/ilate'
  cd '$DEST'
  unzip -o deploy_bundle_orcs_ilate.zip >/dev/null
  cp -R deploy_bundle/elevator_budget_app/* elevator_budget_app/
  cp -R deploy_bundle/03_runtime_tools/* 03_runtime_tools/
  cp -R deploy_bundle/ilate/* ilate/
  zsh elevator_budget_app/install_server_runtime.sh
  if [ ! -f .env ]; then
    cp elevator_budget_app/.env.example .env
  fi
  echo 'Bootstrap base concluído em $DEST'
"
