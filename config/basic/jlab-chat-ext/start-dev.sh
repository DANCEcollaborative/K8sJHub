#!/bin/sh
# Exit if any command fails
set -e

# Print the env var for debug
echo "✅ CHAT_WS_URL at runtime is: $CHAT_WS_URL"

export CHAT_WS_URL="${CHAT_WS_URL}"

echo "✅ Exported CHAT_WS_URL as: $CHAT_WS_URL"

# Start JupyterLab (non-blocking)
start-notebook.py --collaborative --ServerApp.token='' --ServerApp.disable_check_xsrf=True --ServerApp.allow_origin='*' &

# Change to the frontend directory
cd /home/jovyan/frontend

# Watch frontend changes
echo "✅ Starting file watcher..."
npm run watch &

# Start the frontend dev server in foreground
echo "✅ Starting development server..."
exec npm run dev
