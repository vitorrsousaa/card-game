#!/bin/sh
set -e

echo "=== Docker Entrypoint Script ==="
echo "Working directory: $(pwd)"

# Verify ioredis is available (quick check)
if [ -d "/app/node_modules/.pnpm" ]; then
  echo "✓ Dependencies found"
else
  echo "⚠ WARNING: Dependencies not found - rebuild image with: docker compose build"
fi

echo "=== Starting application ==="
exec "$@"
