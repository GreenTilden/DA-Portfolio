#!/bin/bash

# Git add, commit with date prefix, and push script

# Get current date in DDMMMYY format
DATE_PREFIX=$(date +"%d%b%y" | tr '[:lower:]' '[:upper:]')

# Add all changes
echo "Adding all changes..."
git add .

# Check if there are any changes to commit
if git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

# Show what's being committed
echo -e "\nFiles to be committed:"
git diff --cached --name-status

# Prompt for commit message with date prefix
echo -e "\nEnter commit message:"
read -e -i "$DATE_PREFIX " -p "> " COMMIT_MSG

# Commit with the message
if [ -n "$COMMIT_MSG" ]; then
    git commit -m "$COMMIT_MSG"
    
    # Ask if user wants to push
    read -p "Push to remote? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Pushing to remote..."
        git push
        echo "✅ Successfully pushed to remote!"
    else
        echo "📝 Changes committed locally only."
    fi
else
    echo "❌ No commit message provided. Aborting."
    exit 1
fi
