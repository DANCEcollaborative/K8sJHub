#!/bin/bash
set -e

# -----------------------------
# Step 0: Default WebSocket URL
# -----------------------------
: "${CHAT_WS_URL:=http://localhost:3001}"
echo "✅ CHAT_WS_URL is set to: $CHAT_WS_URL"

# -----------------------------
# Step 1: Export for Jupyter
# -----------------------------
export CHAT_WS_URL

# -----------------------------
# Step 2: Start JupyterLab
# -----------------------------
exec jupyter lab \
    --ip=0.0.0.0 \
    --no-browser \
    --allow-root \
    --collaborative \
    --ServerApp.token='' \
    --ServerApp.disable_check_xsrf=True \
    --ServerApp.allow_origin='*'
