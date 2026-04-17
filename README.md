
# Django + React Project

This project combines a Django backend with a React frontend and uses PostgreSQL as the database.

## Project Structure
```
groupProject/
├── backend/          # Django backend
│   ├── backend/     # Django project settings
│   ├── frontend/    # Django app for serving React
│   ├── manage.py
│   └── requirements.txt
└── frontend/        # React frontend
    ├── public/
    ├── src/
    ├── package.json
    └── ...
```

## Database Configuration

This project now uses PostgreSQL as the database. The configuration is set up to work with Docker Compose, but for local development you can also configure it manually.

### Environment Variables

For production deployment or local development:
- `POSTGRES_DB` - Database name (default: postgres)
- `POSTGRES_USER` - Database user (default: postgres)
- `POSTGRES_PASSWORD` - Database password (default: postgres)
- `DB_HOST` - Database host (default: db for Docker, localhost for local)
- `DB_PORT` - Database port (default: 5432)

## Setup Instructions

## Project Structure
```
groupProject/
├── backend/          # Django backend
│   ├── backend/     # Django project settings
│   ├── frontend/    # Django app for serving React
│   ├── manage.py
│   └── requirements.txt
└── frontend/        # React frontend
    ├── public/
    ├── src/
    ├── package.json
    └── ...
```

## Setup Instructions

### Prerequisites
- Docker and Docker Compose installed (recommended)
- Python 3.14 (for local development)
- Node.js 18 (for local development)

### Development Mode with Docker (Recommended)
```bash
# Start the entire application using Docker Compose
docker-compose up --build
```

This will:
1. Build both frontend and backend images
2. Start PostgreSQL database
3. Run Django backend on port 8001
4. Serve React frontend on port 3000

### Local Development (Without Docker)
#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Variables

For local development, create a `.env` file based on the provided `.env.example`:
```bash
cp .env.example .env
# Edit .env with your specific settings
```

## Running the Project

### Development Mode with Docker (Recommended)
1. Run `docker-compose up --build`
2. Access React frontend at `http://localhost:3000`
3. Access Django backend API at `http://localhost:8001`

### Production Mode
```bash
# Build and run using Docker Compose for production
docker-compose -f docker-compose.yml up --build
```

## API Endpoints
The Django backend will serve the React frontend at the root URL and provide API endpoints at `/api/`.
