#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_BUNDLE="$SCRIPT_DIR/CV Web Autofill.app"

if [ -d "$APP_BUNDLE" ]; then
  open "$APP_BUNDLE"
else
  open -a Terminal "$SCRIPT_DIR/Run_CV_Web_Autofill.command"
fi
