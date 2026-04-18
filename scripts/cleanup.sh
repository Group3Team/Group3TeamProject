#!/bin/bash

echo "WARNING: This will completely remove all Docker containers, volumes, networks and images"
read -p "Are you sure you want to proceed? (y/N): " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    echo "Proceeding with cleanup..."
    
    docker compose down
    docker compose down --remove-orphans
    docker compose down --volumes
    docker compose down -v
    docker volume rm beer-near-here_postgres_data 2>/dev/null || true
    docker compose down --rmi all
    docker compose stop
    docker system prune -f
    docker container prune -f
    docker network prune -f
    docker image prune -a -f
    docker system prune -a --volumes -f
    docker builder prune -f
    
    echo "Cleanup completed."
else
    echo "Cleanup cancelled."
fi