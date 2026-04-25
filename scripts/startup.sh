#!/bin/bash

# 1. Docker Clean Up
# Prunes unused containers, networks, and images to free up space.
#docker system prune -f

# 2. Build and Start Containers
docker compose up -d --build

sleep 5
# 3. Database Migrations
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
echo ""
# Print warning in RED
echo -e "\033[0;31m⚠️  If you see 'Error: That username is already taken', press CTRL-C to exit script.\033[0m"
echo ""
docker compose exec backend python manage.py createsuperuser