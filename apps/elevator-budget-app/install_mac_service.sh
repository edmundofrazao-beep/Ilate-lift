#!/bin/zsh

set -euo pipefail

ROOT_DIR="/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/-- ILATE  --/AIProjeto"
APP_DIR="$ROOT_DIR/elevator_budget_app"
PLIST_SOURCE="$APP_DIR/mac/pt.ilate.orcamentos.streamlit.plist"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
PLIST_TARGET="$LAUNCH_AGENTS_DIR/pt.ilate.orcamentos.streamlit.plist"

mkdir -p "$LAUNCH_AGENTS_DIR" "$APP_DIR/.launcher"
cp "$PLIST_SOURCE" "$PLIST_TARGET"
launchctl bootout "gui/$(id -u)" "$PLIST_TARGET" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$(id -u)" "$PLIST_TARGET"
launchctl kickstart -k "gui/$(id -u)/pt.ilate.orcamentos.streamlit"

echo "$PLIST_TARGET"
