DogWalker MVP Technical Specification
Primary Stack: Django (Backend) + React (Frontend)
Hosting Environment: AWS (S3, CloudFront, App Runner, RDS)

1. Cloud Architecture (AWS Deployment)
The application follows a decoupled architecture to separate the UI from the logic, ensuring high performance and security.

Frontend Hosting:
Amazon S3: Stores the production build of the React app (HTML, CSS, JS).
Amazon CloudFront: Acts as the CDN to serve the frontend via HTTPS with low latency.
Backend Hosting:
AWS App Runner: Runs the Dockerized Django application. It handles auto-scaling and SSL termination automatically.
Amazon ECR: Private registry to store the Django Docker images.
Database & Storage:
Amazon RDS (PostgreSQL): Managed relational database for all user, dog, and booking data.
Amazon S3 (Media): Dedicated bucket for storing uploaded dog photos and walker profile images.
Security:
AWS Secrets Manager: Securely stores the SECRET_KEY, Database credentials, and Stripe API keys.
2. Backend Architecture (Django REST Framework)
Core Data Models
The database schema focuses on the relationship between owners, their pets, and the service providers.

from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    is_walker = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=15, blank=True)
    avatar = models.ImageField(upload_to='profiles/', null=True)

class Dog(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dogs')
    name = models.CharField(max_length=100)
    breed = models.CharField(max_length=100)
    special_notes = models.TextField(blank=True)
    photo = models.ImageField(upload_to='dogs/')

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owner_bookings')
    walker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='walker_tasks')
    dog = models.ForeignKey(Dog, on_delete=models.CASCADE)
    date_time = models.DateTimeField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=6, decimal_places=2)
3. Frontend Architecture (React)
Essential Views & Components
Walker Explorer: A searchable grid of available walkers.
Booking Wizard: A modal or page where users select their dog and a time slot from a calendar.
Unified Dashboard:
For Owners: View "Upcoming Walks" and manage "My Dogs."
For Walkers: A "Job Feed" to accept/deny requests and mark walks as finished.
Auth Flow: Sign-up and Login screens using JWT stored in localStorage or HttpOnly cookies.
Technical Tools
Tailwind CSS: For styling without writing custom CSS files.
React Query (TanStack): To handle server state, caching, and loading spinners.
Axios: For clean API requests to the Django backend.
4. MVP Feature Set
User Authentication: Secure login for both walkers and dog owners.
Profile Management: Capability to upload dog details and walker bios.
Real-time Booking: Owners can request a walk; walkers get notified to confirm.
Payment Integration: Stripe Checkout integration for processing payments before the walk starts.
Post-Walk Status: A "Complete" button that triggers an automated email or notification to the owner.
5. Directory Structure
/
├── backend/                # Django Project Root
│   ├── core/               # Settings, WSGI, ASGI
│   ├── api/                # Views, Serializers, URLs
│   ├── users/              # Custom User Logic
│   ├── Dockerfile          # For AWS App Runner
│   └── requirements.txt
├── frontend/               # React Project Root
│   ├── src/
│   │   ├── components/     # UI Building Blocks
│   │   ├── pages/          # Full Page Views
│   │   └── services/       # API calling logic (Axios)
│   ├── tailwind.config.js
│   └── package.json
└── docker-compose.yml      # Local Dev Environment
6. Implementation Roadmap (The "How-To")
Step 1: Build the Django API first. Verify endpoints using the Django Admin and Postman.
Step 2: Scaffold the React app and connect it to the API using JWT.
Step 3: Implement Stripe Checkout on the frontend and a Webhook on the backend.
Step 4: Containerize the backend and push the frontend build to S3.
Step 5: Configure AWS CloudFront to route /api/* requests to the backend and all other requests to the S3 bucket.

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