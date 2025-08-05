#!/bin/bash
echo "🧹 Cleaning up stale Jupyter files..."

# Clear zombie kernels and stale runtime data
rm -rf /home/jovyan/.local/share/jupyter/runtime/*

# Remove nbgrader's database, if it exists
# rm -f /home/jovyan/gradebook.db

# Remove any lingering workspace configs
rm -rf /home/jovyan/.jupyter/lab/workspaces/*

# Optionally clear JupyterLab staging leftovers (extension dev)
rm -rf /home/jovyan/.jupyter/lab/staging/*
