#!/bin/sh
set -e

echo "✅ CHAT_WS_URL at runtime is: $CHAT_WS_URL"

# Start JupyterLab in background
echo "🔄 Starting JupyterLab..."
start-notebook.py \
    --collaborative \
    --ServerApp.token='' \
    --ServerApp.disable_check_xsrf=True \
    --ServerApp.allow_origin='*' &
sleep 5

# Build once before watch
cd /home/jovyan/jlab-chat-ext/frontend
echo "🔄 Building frontend..."
jlpm install
jlpm build

echo "🔄 Starting frontend watcher..."
jlpm watch:labextension &

echo "🔄 Starting frontend dev server..."
exec jlpm dev
