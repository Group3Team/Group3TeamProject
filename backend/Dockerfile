# Use Python 3.14 slim image
FROM python:3.14-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Set working directory
WORKDIR /app

# Install system dependencies including PostgreSQL client
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    python3-dev \
    binutils \
    libproj-dev \
    gdal-bin \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy project files
COPY . .

# Set PYTHONPATH so the current directory is recognized
ENV PYTHONPATH=/app/backend

# Change working directory so python can find wsgi.py and settings.py locally
WORKDIR /app/backend

# Collect static files
RUN python manage.py collectstatic --noinput || echo "Static collection skipped"

# Expose port
EXPOSE 8000

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "wsgi:application"]
