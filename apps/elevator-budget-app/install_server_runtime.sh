#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VENV_DIR="${VENV_DIR:-$ROOT_DIR/.venv}"

cd "$ROOT_DIR"

python3 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"
python -m pip install --upgrade pip
pip install -r elevator_budget_app/requirements.txt

echo "Runtime pronto em $VENV_DIR"
