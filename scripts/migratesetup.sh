#!/bin/bash

echo "Waiting for database to be ready..."
until docker compose -f docker-compose.prod.yml exec backend bash -c "cd /app/backend && python manage.py showmigrations" > /dev/null 2>&1; do

    echo "  DB not ready, retrying in 2 seconds..."
    sleep 2
done
echo "Database is ready!"


docker compose -f docker-compose.prod.yml exec backend bash -c "cd /app/backend && python manage.py makemigrations walks"
docker compose -f docker-compose.prod.yml exec backend bash -c "cd /app/backend && python manage.py makemigrations users"
docker compose -f docker-compose.prod.yml exec backend bash -c "cd /app/backend && python manage.py makemigrations"
sleep 3
docker compose -f docker-compose.prod.yml exec backend bash -c "cd /app/backend && python manage.py migrate"
sleep 3
docker compose -f docker-compose.prod.yml exec backend bash -c "cd /app/backend && python manage.py seed_data"
sleep 3
docker compose -f docker-compose.prod.yml exec backend bash -c "cd /app/backend && python manage.py createsuperuser"
