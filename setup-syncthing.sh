#!/bin/bash
# Syncthing setup script for both machines

echo "=== Syncthing Setup ==="
echo "Run this on both machines"

# Install Syncthing
if command -v apt-get &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y syncthing
elif command -v pacman &> /dev/null; then
    sudo pacman -S syncthing
fi

# Start Syncthing
syncthing &

echo "Syncthing started!"
echo "Access web UI at: http://localhost:8384"
echo ""
echo "Setup steps:"
echo "1. Open http://localhost:8384 on both machines"
echo "2. On Linux box: Actions > Show ID"
echo "3. On Terminal PC: Add Remote Device > paste Linux box ID"
echo "4. Accept connection on Linux box"
echo "5. Share the project folder between devices"
echo ""
echo "Recommended .stignore file created..."

# Create .stignore file
cat > .stignore << 'EOF'
node_modules
.git
dist
.DS_Store
*.log
.env
.env.local
*.tmp
*.swp
EOF