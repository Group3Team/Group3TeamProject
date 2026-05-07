# Quickstart — DogGO Local Development Setup

**Feature**: specs/001-user-account-walk-scheduling/spec.md  
**Date**: 2026-05-07

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.12+ | Django backend runtime |
| Node.js | 18+ | React/Vite frontend build tooling |
| PostgreSQL + PostGIS | 15+ | Primary data store with geospatial support |
| Redis | 7+ | Channels layer for real-time walk alerts |
| pip / venv (Python) | latest | Virtual environment management |
| npm or pnpm | latest | Frontend dependency management |

---

## Step 1: Database Setup

### Option A — Docker Compose (Recommended)

```bash
# Start PostgreSQL with PostGIS and Redis via docker-compose.yml
docker compose up -d db redis
```

### Option B — Local Installation

```bash
# Install PostgreSQL 15+ with PostGIS extension (Linux example)
sudo apt install postgresql-15-postgis-3
sudo -u postgres createuser -s $USER
createdb doggo

# Enable PostGIS extension in the database
psql -d doggo -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### Option C — Existing Dockerized Setup (from project)

If `docker-compose.yml` already exists with db service running:

```bash
docker compose up -d  # Start all services from existing config
# Verify: docker exec doggo-db-1 pg_isready && echo OK
```

---

## Step 2: Environment Variables

Create `.env` files for backend and frontend. The environment variables override defaults defined in `settings.py`.

### Backend (.env in /backend)

```bash
DJANGO_SECRET_KEY='change-me-in-production-use-generate-secret-key-script'
DEBUG=true
ALLOWED_HOSTS=localhost,127.0.0.1

# Database — matches docker-compose db service name "db" or local host
POSTGRES_DB=doggo
POSTGRES_USER=na                # your system username or postgres user
POSTGRES_PASSWORD=postgres      # set this to your actual password
DB_HOST=db                      # use 'localhost' if running PostgreSQL locally outside Docker
DB_PORT=5432

# CORS — allow frontend dev server
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Redis for Channels real-time layer
REDIS_URL=redis://redis:6379/0    # docker-compose service name "redis"
```

### Frontend (.env in /frontend)

```bash
VITE_API_URL=http://localhost:8000/api   # Django backend dev server port 8000
```

---

## Step 3: Backend Setup

Navigate to `/backend` and set up the virtual environment. The project already has a `venv/` directory — activate it if it exists or create one fresh:

```bash
cd backend

# Activate existing venv (if present) or create new one
source venv/bin/activate || python3 -m venv venv && source venv/bin/activate

# Install dependencies (Django, DRF, channels-redis, psycopg2-binary, etc.)
pip install -r requirements.txt
```

Install additional packages required for this feature:

```bash
# Django filters for search/filter/ordering on list endpoints
pip install django-filter
```

### Run Migrations

The existing project already has users app migrations (0001_initial.py through 0003_merge). For the new fields and updates from this spec, create a migration:

```bash
# Apply any pending migrations first
python manage.py migrate

# Create migrations for updated models (User role change, Dog.aggressiveness added, WalkerProfile soft-toggle)
python manage.py makemigrations users walks
python manage.py migrate
```

### Seed Data (Optional — For Testing)

Create a superuser and sample data:

```bash
# Create superuser for admin access
python manage.py createsuperuser --username admin --email admin@example.com

# Or create via script with password set interactively
echo "from django.contrib.auth import get_user_model; U=get_user_model(); U.objects.create_superuser('admin','a@e.com','admin123')" | python manage.py shell
```

---

## Step 4: Frontend Setup

Navigate to `/frontend` and install dependencies. The project already has a `node_modules/` directory if dependencies were previously installed via npm/pnpm/yarn:

```bash
cd frontend

# Check if node_modules exists; skip install if so (as per user guidance)
[ ! -d node_modules ] && npm install || echo "Dependencies already installed"

# Install additional dependencies needed for this feature
npm install axios react-router-dom leaflet @types/leaflet 2>/dev/null || true
```

### Verify Frontend Dependencies

If `node_modules` was pre-installed, verify the required packages are present:

```bash
ls node_modules/react/node_modules/.package-lock.json \
   node_modules/axios/package.json \
   node_modules/react-router-dom/package.json 2>/dev/null || npm install axios react-router-dom leaflet --save
```

---

## Step 5: Start Development Servers

### Terminal 1 — Backend (Django dev server on port 8000)

```bash
cd backend && source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

Verify it's running: `curl -s http://localhost:8000/api/users/me/ | head` (expect 401 without auth, or a user object with valid session).

### Terminal 2 — Frontend (Vite dev server on port 3000)

```bash
cd frontend && npm run dev
```

Verify it's running: open `http://localhost:3000` in browser. The Vite proxy configured in vite.config.js should forward `/api/*` requests to the backend at localhost:8000.

### Optional — Channels WebSocket worker (Terminal 3, if testing real-time alerts)

```bash
cd backend && source venv/bin/activate
python manage.py runserver 0.0.0.0:8001 --settings=config.asgi_settings
# Or use daphne directly for ASGI mode:
daphme -b 0.0.0.0 -p 8001 config.asgi:application
```

---

## Step 6: Verify End-to-End Flow

1. **Register**: Visit `http://localhost:3000/signup`, fill in username, phone (+1555XXXXXXX), address, password. Select role (Owner or Walker). Submit — expect redirect to dashboard.
2. **Login**: If already registered, visit `http://localhost:3000/login` and authenticate with session-based credentials.
3. **Create Dog**: Navigate to Dogs page, fill in dog name, breed, size (Small/Medium/Large), disposition notes, aggressiveness (Low/Medium/High). Save.
4. **Schedule Walk** (Owner): Open OwnerDashboard calendar widget, select date/time from available slots, choose 30 or 60-minute duration, confirm pickup address details, click Schedule — expect walk request created with status SEARCHING.
5. **Accept Walk Request** (Walker): If a second walker account is online and within radius, they should receive real-time WebSocket alert on WalkerDashboard "Find Jobs" feed. Click Accept — expect atomic transaction acceptance confirmed via HTTP 200 response or 409 Conflict if already taken.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `Could not find the GDAL library` | PostGIS/geospatial dependencies missing | Install `libgdal-dev`, `libproj-dev`, `binutils` system packages; reinstall psycopg2-binary after |
| `DJANGO_SECRET_KEY environment variable is required` | .env file not loaded or key missing | Create/verify `/backend/.env` contains `DJANGO_SECRET_KEY=...` |
| CORS error in browser console (`Access-Control-Allow-Origin`) | Frontend origin not in allowed list | Verify `CORS_ALLOWED_ORIGINS=http://localhost:3000` is set correctly in backend settings and .env |
| WebSocket connection refused (ws://) | Channels worker not running or wrong port | Start daphne on a separate port (8001) for ASGI/WebSocket; ensure `channels-redis` is in requirements.txt |
| `Relation does not exist` during migration | Missing PostGIS extension | Run `CREATE EXTENSION IF NOT EXISTS postgis;` in the PostgreSQL database |
