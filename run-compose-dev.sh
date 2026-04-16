docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up -d

sleep 5

docker exec django-backend python manage.py makemigrations
docker exec django-backend python manage.py migrate