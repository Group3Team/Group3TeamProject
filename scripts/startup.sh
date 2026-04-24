#!/bin/bash

# 1. Docker Clean Up
# Prunes unused containers, networks, and images to free up space.
docker system prune -f

# 2. Build and Start Containers
docker compose up -d --build

# 3. Database Migrations
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser