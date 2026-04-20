#!/bin/zsh

set -euo pipefail

PLIST_TARGET="$HOME/Library/LaunchAgents/pt.ilate.orcamentos.streamlit.plist"

if [[ -f "$PLIST_TARGET" ]]; then
  launchctl bootout "gui/$(id -u)" "$PLIST_TARGET" >/dev/null 2>&1 || true
  rm -f "$PLIST_TARGET"
fi
