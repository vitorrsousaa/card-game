#!/bin/sh
set -e

# Ensure dependencies are installed when container starts
# This is necessary because volumes may overwrite node_modules from the image
echo "Ensuring dependencies are installed..."
pnpm install --frozen-lockfile

# Execute the command passed as argument
echo "Starting application..."
exec "$@"
