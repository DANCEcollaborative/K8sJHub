#!/bin/sh
# Exit if any command fails
set -e

echo "✅ CHAT_WS_URL at runtime is: $CHAT_WS_URL"
export CHAT_WS_URL="${CHAT_WS_URL}"

# Start JupyterLab in background
start-notebook.py --collaborative --ServerApp.token='' \
  --ServerApp.disable_check_xsrf=True --ServerApp.allow_origin='*' &

# Switch into frontend
cd /home/jovyan/frontend

# Clean and re-link in *dev mode*
echo "✅ Setting up dev mode..."
jlpm install
jupyter labextension develop . --overwrite

# Start watchers
echo "✅ Starting file watcher..."
npm run watch &

# Start the dev server in foreground
echo "✅ Starting development server..."
exec npm run dev
