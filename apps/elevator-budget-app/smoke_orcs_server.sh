#!/bin/zsh

set -euo pipefail

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-8501}"
URL="http://$HOST:$PORT/_stcore/health"

curl --silent --fail --max-time 10 "$URL"
echo
echo "OK: $URL"
