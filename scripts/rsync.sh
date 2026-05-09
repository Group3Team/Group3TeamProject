#!/bin/bash
set -e # Exit immediately if a command fails

# Configuration
REMOTE_USER="root"
REMOTE_HOST="192.168.2.105"
REMOTE_PATH="~/Group3TeamProject/"


echo "🔄 Syncing code to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"ss

rsync -avz --delete --progress \
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
  ./ "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"

echo "✅ Sync completed successfully!"
