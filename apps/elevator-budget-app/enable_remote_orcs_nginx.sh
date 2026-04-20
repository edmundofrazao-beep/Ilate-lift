#!/bin/zsh

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Uso: zsh elevator_budget_app/enable_remote_orcs_nginx.sh user@server /destino/AIProjeto"
  exit 1
fi

TARGET="$1"
DEST="$2"

ssh "$TARGET" "
  set -e
  sudo cp '$DEST/elevator_budget_app/deploy/nginx/orcs-ilate.nginx.conf' /etc/nginx/sites-available/orcs-ilate.conf
  if [ ! -L /etc/nginx/sites-enabled/orcs-ilate.conf ]; then
    sudo ln -s /etc/nginx/sites-available/orcs-ilate.conf /etc/nginx/sites-enabled/orcs-ilate.conf
  fi
  sudo nginx -t
  sudo systemctl reload nginx
"
