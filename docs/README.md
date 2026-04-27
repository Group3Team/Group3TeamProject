# Django + React + Docker Project

A Dockerized full-stack application with a Django REST backend, Vite/React frontend, and PostgreSQL database.

## Project Structure

```
Group3TeamProject/
├── backend/
│   ├── apps/
│   │   └── accounts/      # Accounts app
│   ├── config/             # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile          # Multi-stage build (Node + Nginx)
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
├── docker-compose.dev.yml
├── .env
└── README.md
```

## Prerequisites

- Docker and Docker Compose
- **Note:** A Python virtual environment (venv) is not needed. All backend dependencies run inside the Docker containers.

## Setup Instructions

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd Group3TeamProject
```

Copy `.env.example` to `.env` and update values as needed (or use the existing `.env`).

### 2. Build and start all services

```bash
docker compose up --build -d
```

### 3. Run database migrations

```bash
docker exec django-backend python manage.py migrate
```

### 4. Create a superuser (optional)

```bash
docker exec -it django-backend python manage.py createsuperuser
```

## Services


| Service  | URL                                            | Description                  |
| -------- | ---------------------------------------------- | ---------------------------- |
| Frontend | [http://localhost:3000](http://localhost:3000) | Vite/React (served by Nginx) |
| Backend  | [http://localhost:8000](http://localhost:8000) | Django REST API (Gunicorn)   |
| Database | localhost:5432                                 | PostgreSQL 15                |


## Common Commands

```bash
# Start services
docker compose -f docker-compose.dev.yml up -d

# Stop services
docker compose -f docker-compose.dev.yml down

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Run migrations
docker exec django-backend python manage.py migrate

# Make migrations
docker exec django-backend python manage.py makemigrations

# Access Django shell
docker exec -it django-backend python manage.py shell

# Install new frontend packages
docker exec react-frontend npm install <package-name>
```

## Tech Stack

- **Frontend:** React 19, Vite, Nginx
- **Backend:** Django 5.2, Django REST Framework, Gunicorn
- **Database:** PostgreSQL 15
- **Containerization:** Docker, Docker Compose

## API Endpoints

The Django backend provides Admin panel available at `/admin/`.