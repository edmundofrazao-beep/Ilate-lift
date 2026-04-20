#!/bin/zsh

set -euo pipefail

ROOT_DIR="/Users/edmundofrazao/Library/CloudStorage/OneDrive-Personale/-- ILATE  --/AIProjeto"
APP_DIR="$ROOT_DIR/elevator_budget_app"
LOG_DIR="$APP_DIR/.launcher"
STREAMLIT_PID_FILE="$LOG_DIR/streamlit.pid"
STREAMLIT_LOG="$LOG_DIR/streamlit.log"
PORT="8501"
URL="http://localhost:$PORT"
PYTHON_BIN="/Library/Frameworks/Python.framework/Versions/3.14/bin/python3"

mkdir -p "$LOG_DIR"

is_http_up() {
  curl --silent --fail --max-time 2 "$URL/_stcore/health" >/dev/null 2>&1
}

cleanup_stale_pid() {
  if [[ -f "$STREAMLIT_PID_FILE" ]]; then
    PID="$(cat "$STREAMLIT_PID_FILE" 2>/dev/null || true)"
    if [[ -z "${PID:-}" ]] || ! kill -0 "$PID" 2>/dev/null; then
      rm -f "$STREAMLIT_PID_FILE"
    fi
  fi
}

start_streamlit() {
  cd "$ROOT_DIR"
  nohup "$PYTHON_BIN" -m streamlit run "$APP_DIR/app.py" \
    --server.headless true \
    --server.port "$PORT" \
    > "$STREAMLIT_LOG" 2>&1 &
  echo $! > "$STREAMLIT_PID_FILE"
}

cleanup_stale_pid

while true; do
  cleanup_stale_pid
  PID=""
  if [[ -f "$STREAMLIT_PID_FILE" ]]; then
    PID="$(cat "$STREAMLIT_PID_FILE" 2>/dev/null || true)"
  fi

  if [[ -z "${PID:-}" ]] || ! kill -0 "$PID" 2>/dev/null || ! is_http_up; then
    start_streamlit
    sleep 4
  fi

  sleep 10
done
