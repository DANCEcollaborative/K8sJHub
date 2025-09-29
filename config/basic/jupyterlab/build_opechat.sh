#!/bin/bash
set -e

OPECHAT_DIR="/Users/rcmurray/git/DANCEcollaborative/jupyter-opechat"
TARGET_DIST="./dist"

echo "Cleaning previous builds in jupyter-opechat..."
cd "$OPECHAT_DIR"
jlpm clean:all || true
rm -rf dist build *.egg-info

echo "Building frontend in jupyter-opechat..."
jlpm build:prod

echo "Building Python wheel in jupyter-opechat..."
python -m hatch build

echo "Copying wheel to target dist directory..."
mkdir -p "$TARGET_DIST"
cp dist/jupyter_opechat-*.whl "$TARGET_DIST"

echo "Build complete. Wheel is in $TARGET_DIST"
