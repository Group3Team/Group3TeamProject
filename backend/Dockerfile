# Use Python 3.13 slim image LTS
FROM python:3.13.13-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Set working directory
WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    python3-dev \
    binutils \
    libproj-dev \
    gdal-bin \
    libgdal-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from the correct path
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend project files
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput || echo "Static collection skipped"

# Expose port
EXPOSE 8000

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "wsgi:application"]
