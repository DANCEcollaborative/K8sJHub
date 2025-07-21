#!/bin/bash
set -e

echo "🔧 Clearing prior builds ..."
cd frontend
rm -rf node_modules yarn.lock package-lock.json

echo "🔧 Building frontend with jlpm..."
jlpm install
jlpm build
cd ..

echo "📁 Preparing Python package directory..."
mkdir -p jlab_ws_chat_extension/labextension

echo "📦 Copying frontend build artifacts..."
cp frontend/package.json jlab_ws_chat_extension/labextension/
cp frontend/install.json jlab_ws_chat_extension/labextension/
cp -r frontend/lib jlab_ws_chat_extension/labextension/

echo "✅ Frontend build copied to Python package."
