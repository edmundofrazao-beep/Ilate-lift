#!/bin/zsh

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Uso: zsh elevator_budget_app/verify_remote_orcs.sh user@server /destino/AIProjeto [public_url]"
  exit 1
fi

TARGET="$1"
DEST="$2"
PUBLIC_URL="${3:-}"

echo "== systemd =="
ssh "$TARGET" "sudo systemctl status orcs-ilate --no-pager || true"

echo
echo "== local smoke =="
ssh "$TARGET" "cd '$DEST' && HOST=127.0.0.1 PORT=8501 zsh elevator_budget_app/smoke_orcs_server.sh"

if [[ -n "$PUBLIC_URL" ]]; then
  echo
  echo "== public check =="
  curl --silent --show-error --fail --max-time 15 "$PUBLIC_URL" >/dev/null
  echo "OK: $PUBLIC_URL"
fi
