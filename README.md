
# Django + React Project

This project combines a Django backend with a React frontend.

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

### 1. Backend Setup
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
python manage.py migrate  # Run database migrations
python manage.py runserver  # Start Django development server
```

### 2. Frontend Setup
```bash
cd frontend
npm install  # Install React dependencies
npm start    # Start React development server
```

### 3. Build for Production
```bash
cd frontend
npm run build  # Build React app for production
cd ../backend
python manage.py collectstatic  # Collect static files
python manage.py runserver      # Start Django server
```

## Running the Project

### Development Mode
1. Start Django backend: `cd backend && source venv/bin/activate && python manage.py runserver`
2. Start React frontend: `cd frontend && npm start`
3. Access the app at `http://localhost:3000`

### Production Mode
1. Build React app: `cd frontend && npm run build`
2. Collect static files: `cd backend && python manage.py collectstatic`
3. Start Django server: `python manage.py runserver`
4. Access the app at `http://localhost:8000`

## API Endpoints
The Django backend will serve the React frontend at the root URL and provide API endpoints at `/api/`.
