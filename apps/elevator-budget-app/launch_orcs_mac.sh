#!/bin/zsh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

exec zsh "$SCRIPT_DIR/launch_orcamentos_mac.sh"
