#!/bin/sh
set -e

# -----------------------------
# 1️⃣ Print the CHAT_WS_URL
# -----------------------------
echo "✅ CHAT_WS_URL at runtime is: $CHAT_WS_URL"

# -----------------------------
# 2️⃣ Start JupyterLab server
# -----------------------------
sleep 5

echo "🔄 Starting JupyterLab..."
start-notebook.py \
    --collaborative \
    --ServerApp.token='' \
    --ServerApp.disable_check_xsrf=True \
    --ServerApp.allow_origin='*' &

# -----------------------------
# 3️⃣ Change to frontend directory
# -----------------------------
cd /home/jovyan/jlab-chat-ext/frontend

# Start frontend watcher & dev server
echo "🔄 Starting frontend watcher..."
npm run watch &

echo "🔄 Starting frontend dev server..."
exec npm run dev
