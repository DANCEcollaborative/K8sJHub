#!/bin/sh
# This script starts JupyterLab and then runs two commands in parallel.

start-notebook.py --collaborative --ServerApp.token='' --ServerApp.disable_check_xsrf=True --ServerApp.allow_origin='*' 

# Exit the script if any command fails
set -e

# Run the first command in the background (&)
echo "Starting file watcher..."
npm run watch &

# Run the second command in the foreground
# This command keeps the container running
echo "Starting development server..."
npm run dev

# The script will exit when 'npm run dev' exits.