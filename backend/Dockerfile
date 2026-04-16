# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Set working directory
RUN mkdir /backend
WORKDIR /backend

COPY requirements.txt .

# Install system dependencies
RUN pip install -r requirements.txt

# Copy requirements first for better caching
COPY . /backend/

# Expose port
EXPOSE 8000

# Run the application

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]
