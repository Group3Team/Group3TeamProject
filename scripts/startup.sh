#!/bin/bash

# 1. Docker Clean Up
# Prunes unused containers, networks, and images to free up space.
# --force allows it to run without a confirmation prompt.
docker system prune -f

# 2. Build and Start Containers
# -d runs in detached mode, --build ensures images are updated.
docker compose up -d --build

# 3. Database Migrations
echo "Running database migrations..."
docker compose exec backend python manage.py migrate