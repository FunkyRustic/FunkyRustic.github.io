#!/bin/zsh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${1:-8080}"
URL="http://localhost:${PORT}/"

cd "$SCRIPT_DIR"

echo "Starting local preview at ${URL}"
echo "Press Control-C in this window to stop the server."

python3 -m http.server "$PORT" >/tmp/funkyrustic-preview.log 2>&1 &
SERVER_PID=$!

cleanup() {
  if kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

sleep 1

if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
  echo
  echo "Preview server failed to start."
  echo "Recent log output:"
  sed -n '1,20p' /tmp/funkyrustic-preview.log
  exit 1
fi

open "$URL"

wait "$SERVER_PID"
