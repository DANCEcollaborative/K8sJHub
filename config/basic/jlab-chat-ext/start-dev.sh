#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "✅ CHAT_WS_URL at runtime is: $CHAT_WS_URL"

# --- Start TypeScript Watcher ---
# Run the `tsc` watcher from within the 'frontend' directory in the background.
# This compiles your TS files as you edit them.
echo "🔄 Starting TypeScript watcher in the background..."
(cd "/home/jovyan/jlab-chat-ext/frontend" && jlpm run watch) &

# --- Start JupyterLab Server ---
# Start JupyterLab with its built-in watcher. Because the extension is now
# correctly installed and linked, this is all that's needed.
echo "🚀 Starting JupyterLab in development mode..."
jupyter lab --watch --allow-root --ip=0.0.0.0 --ServerApp.token=''