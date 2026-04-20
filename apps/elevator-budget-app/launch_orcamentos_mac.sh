#!/bin/zsh

set -euo pipefail

ROOT_DIR="/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/-- ILATE  --/AIProjeto"
APP_DIR="$ROOT_DIR/elevator_budget_app"
LOG_DIR="$APP_DIR/.launcher"
PORT="8501"
URL="http://localhost:$PORT"
SERVICE_INSTALLER="$APP_DIR/install_mac_service.sh"
PLIST_TARGET="$HOME/Library/LaunchAgents/pt.ilate.orcamentos.streamlit.plist"

mkdir -p "$LOG_DIR"

is_http_up() {
  curl --silent --fail --max-time 2 "$URL/_stcore/health" >/dev/null 2>&1
}

if [[ ! -f "$PLIST_TARGET" ]]; then
  "$SERVICE_INSTALLER" >/dev/null
fi

launchctl kickstart -k "gui/$(id -u)/pt.ilate.orcamentos.streamlit" >/dev/null 2>&1 || "$SERVICE_INSTALLER" >/dev/null

for _ in {1..20}; do
  if is_http_up; then
    break
  fi
  sleep 1
done

open "$URL"
