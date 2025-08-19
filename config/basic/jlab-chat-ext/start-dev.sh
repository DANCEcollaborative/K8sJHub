#!/bin/bash
set -e

# Optional: echo WS URL for debugging
echo "CHAT_WS_URL = ${CHAT_WS_URL}"

# Start JupyterLab in dev mode
exec jupyter lab \
    --ip=0.0.0.0 \
    --no-browser \
    --allow-root \
    --ServerApp.token='' \
    --ServerApp.disable_check_xsrf=True \
    --ServerApp.allow_origin='*'
