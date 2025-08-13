#!/bin/sh
set -e

# -----------------------------
# 1️⃣ Print the CHAT_WS_URL
# -----------------------------
echo "✅ CHAT_WS_URL at runtime is: $CHAT_WS_URL"

# -----------------------------
# 2️⃣ Ensure shared folder exists and has proper permissions
# -----------------------------
SHARED_DIR="/home/jovyan/jlab-chat-ext/shared"
echo "🔧 Ensuring shared folder exists at $SHARED_DIR..."
mkdir -p "$SHARED_DIR"
chown -R jovyan:users "$SHARED_DIR"

# -----------------------------
# 3️⃣ Symlink shared folder into /home/jovyan for visibility
# -----------------------------
if [ ! -L "/home/jovyan/shared" ]; then
    echo "🔗 Creating symlink /home/jovyan/shared → $SHARED_DIR"
    ln -s "$SHARED_DIR" /home/jovyan/shared
fi

# -----------------------------
# 4️⃣ Start JupyterLab server
# -----------------------------
sleep 5

echo "🔄 Starting JupyterLab..."
start-notebook.py \
    --collaborative \
    --ServerApp.root_dir=/home/jovyan/jlab-chat-ext/shared \
    --ServerApp.token='' \
    --ServerApp.disable_check_xsrf=True \
    --ServerApp.allow_origin='*' &

# -----------------------------
# 5️⃣ Change to frontend directory
# -----------------------------
FRONTEND_DIR="/home/jovyan/jlab-chat-ext/frontend"

if [ -d "$FRONTEND_DIR" ]; then
    cd "$FRONTEND_DIR"
else
    echo "❌ Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

# -----------------------------
# 6️⃣ Start frontend watcher & dev server
# -----------------------------
echo "🔄 Starting frontend watcher..."
npm run watch &

echo "🔄 Starting frontend dev server..."
exec npm run dev
