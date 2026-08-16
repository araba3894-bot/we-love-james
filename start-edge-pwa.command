#!/bin/bash
# Double-click this file (or run in Terminal) to serve Neo Velvet City for Edge PWA install.
cd "$(dirname "$0")"
PORT=8080

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port $PORT is already in use — opening existing server..."
else
  echo "Starting local server at http://127.0.0.1:$PORT ..."
  echo "Keep this window open while playing / installing."
  echo "Press Ctrl+C to stop."
  echo ""
  /usr/bin/python3 -m http.server "$PORT" --bind 127.0.0.1 &
  SERVER_PID=$!
  sleep 0.6
  trap 'kill $SERVER_PID 2>/dev/null' EXIT
fi

# Open Microsoft Edge if installed; otherwise fall back to default browser.
EDGE_APP="/Applications/Microsoft Edge.app"
URL="http://127.0.0.1:${PORT}/update.html"
if [ -d "$EDGE_APP" ]; then
  open -a "Microsoft Edge" "$URL"
else
  open "$URL"
fi

# If we started the server in background for open-only case when already running,
# keep the shell attached when we launched python above.
if [ -n "${SERVER_PID:-}" ]; then
  wait "$SERVER_PID"
fi
