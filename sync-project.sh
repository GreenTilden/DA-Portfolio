#!/bin/bash
# One-way sync from this machine to remote

REMOTE_HOST="your-linux-box"  # Replace with IP or hostname
REMOTE_USER="darney"
REMOTE_PATH="~/projects/greentilden.github.io"
LOCAL_PATH="."

# Install fswatch if not present
if ! command -v fswatch &> /dev/null; then
    echo "Installing fswatch..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get install -y fswatch
    elif command -v brew &> /dev/null; then
        brew install fswatch
    fi
fi

echo "Starting sync to $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"
echo "Press Ctrl+C to stop"

# Initial sync
rsync -avz --exclude-from='.rsyncignore' $LOCAL_PATH/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

# Watch for changes and sync
fswatch -o . -e "\.git" -e "node_modules" -e "dist" | while read f; do
    echo "Changes detected, syncing..."
    rsync -avz --exclude-from='.rsyncignore' $LOCAL_PATH/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/
done