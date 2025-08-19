#!/bin/bash
set -e

echo "✅ CHAT_WS_URL at runtime is: $CHAT_WS_URL"
# export CHAT_WS_URL="${CHAT_WS_URL}"
export CHAT_WS_URL="https://bree.lti.cs.cmu.edu/bazaar/login?roomName=regex&roomId=505&id=1&username=Robbie&html=chat_mm"

echo "🔄 Cleaning any stale build artifacts..."
rm -rf /home/jovyan/frontend/node_modules \
       /home/jovyan/frontend/yarn.lock

echo "📦 Installing frontend deps + building..."
cd /home/jovyan/frontend
jlpm install
jlpm build

echo "📂 Syncing built labextension into serverextension..."
mkdir -p /home/jovyan/serverextension/src/jlab_chat_ext/labextension
cp -r /home/jovyan/frontend/jlab_chat_ext/labextension/* /home/jovyan/serverextension/src/jlab_chat_ext/labextension/

echo "🐍 Reinstalling Python serverextension (editable)..."
cd /home/jovyan/serverextension
pip install -e .

echo "🧹 Running cleanup script..."
/usr/local/bin/start-notebook.d/cleanup.sh || true

echo "🚀 Starting JupyterLab..."
start-notebook.py --collaborative --ServerApp.token='' \
  --ServerApp.disable_check_xsrf=True --ServerApp.allow_origin='*'
