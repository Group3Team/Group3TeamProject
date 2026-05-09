#!/usr/bin/env bash
set -e

# Wait for PostgreSQL to become ready
until pg_isready -h db -p 5432; do
  echo "Waiting for database..."
  sleep 2
done

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Collect static files (production)
if [ "${DJANGO_ENV}" = "production" ]; then
  echo "Collecting static files..."
  python manage.py collectstatic --noinput
fi

echo "Starting Daphne ASGI server on 0.0.0.0:8000..."
exec "$@"

