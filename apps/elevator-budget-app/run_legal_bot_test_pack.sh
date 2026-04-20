#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")/.."
exec python3 elevator_budget_app/run_legal_bot_test_pack.py
