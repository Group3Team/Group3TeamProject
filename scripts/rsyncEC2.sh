#!/bin/bash

# --- Configuration ---
SOURCE="/home/na/Desktop/CodePlatoon/Group3TeamProject/"
DEST_USER="ubuntu"
DEST_IP="3.141.121.100"
DEST_PATH="/home/ubuntu/Group3TeamProject"
KEY_PATH="$HOME/Downloads/Beer1.pem"

# --- Script Logic ---

if [ ! -f "$KEY_PATH" ]; then
    echo "Error: Key file not found at $KEY_PATH"
    exit 1
fi

echo "Syncing to $DEST_IP as $DEST_USER..."

# --rsync-path="sudo rsync" allows rsync to modify files 
# even if they were created by Docker/root on the server.
rsync -avzP --delete \
    -e "ssh -i $KEY_PATH -o StrictHostKeyChecking=no" \
    --rsync-path="sudo rsync" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'venv' \
    --exclude '__pycache__' \
    --exclude='.git/' \
    --exclude='node_modules/' \
    --exclude='__pycache__/' \
    --exclude='*.pyc' \
    --exclude='*.pyo' \
    --exclude='venv/' \
    --exclude='.venv/' \
    --exclude='dist/' \
    --exclude='build/' \
    --exclude='postgres_data/' \
    --exclude='*.log' \
    --exclude='rsync.sh' \
    --exclude='venv_startup.sh' \
    --exclude='.DS_Store' \
    --exclude='Thumbs.db' \
    --exclude='specs/' \
    --exclude='.kilo/' \
    --exclude='.kilocode/' \
    --exclude='.specify/' \
    --exclude='venv_startup.sh' \
    --exclude='docker-compose.override.yml' \
    "$SOURCE" "$DEST_USER@$DEST_IP:$DEST_PATH"

if [ $? -eq 0 ]; then
    echo "------------------------------"
    echo "Sync Complete!"
else
    echo "------------------------------"
    echo "Sync failed. Check if the server is up or if the IP changed."
fi
