#!/bin/bash

echo "🧹 Cleaning up existing development processes..."

# Kill any existing Vite processes
pkill -f "vite" 2>/dev/null || true
pkill -f "node.*dev" 2>/dev/null || true

# Wait for processes to terminate
sleep 2

# Kill anything using our target port (5176)
lsof -ti:5176 2>/dev/null | xargs kill -9 2>/dev/null || true

# Double-check processes are gone
REMAINING=$(ps aux | grep -E "(vite|node.*dev)" | grep -v grep | wc -l)
if [ $REMAINING -gt 0 ]; then
    echo "⚠️  Some processes may still be running. Force killing..."
    pkill -9 -f "vite" 2>/dev/null || true
    pkill -9 -f "node.*dev" 2>/dev/null || true
    sleep 1
fi

echo "✅ Cleanup complete. Starting fresh development server..."

# Start development server (no build needed for dev mode)
npm run dev -- --host
