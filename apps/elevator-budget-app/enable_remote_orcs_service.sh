#!/bin/zsh

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Uso: zsh elevator_budget_app/enable_remote_orcs_service.sh user@server /destino/AIProjeto"
  exit 1
fi

TARGET="$1"
DEST="$2"

ssh "$TARGET" "
  set -e
  if [ ! -f '$DEST/.env' ]; then
    echo 'Falta $DEST/.env com OPENAI_API_KEY'
    exit 1
  fi

  sudo cp '$DEST/elevator_budget_app/deploy/systemd/orcs-ilate.service' /etc/systemd/system/orcs-ilate.service
  sudo systemctl daemon-reload
  sudo systemctl enable orcs-ilate
  sudo systemctl restart orcs-ilate
  sudo systemctl status orcs-ilate --no-pager || true
"
