#!/bin/bash

# Kill process on port 3001
echo "Cleaning up port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Clean up tsx IPC pipes
echo "Cleaning up tsx IPC pipes..."
find /var/folders -name "tsx-*.pipe" -type p -delete 2>/dev/null || true
find /tmp -name "tsx-*.pipe" -type p -delete 2>/dev/null || true

echo "Cleanup complete!"
