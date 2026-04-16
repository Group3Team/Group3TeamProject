#!/bin/bash
set -e

# Build images
docker compose -f docker-compose.dev.yml build --no-cache
echo "*****build"
# Run startproject before starting services, so gunicorn can find config.wsgi 
#config is a standard naming convention seen for django project
# docker compose -f docker-compose.dev.yml run --rm backend django-admin startproject config .
echo "*****config"
# Create apps
docker compose -f docker-compose.dev.yml run --rm backend sh -c "mkdir -p apps/accounts && python manage.py startapp accounts apps/accounts"

echo "*****accounts"
# Fix app name in apps.py files (startapp sets name to 'accounts' instead of 'apps.accounts')
docker compose -f docker-compose.dev.yml run --rm backend python << 'EOF'
import os

for app in ['accounts']:
    path = f'apps/{app}/apps.py'
    with open(path, 'r') as f:
        content = f.read()
    content = content.replace(f"name = '{app}'", f"name = 'apps.{app}'")
    with open(path, 'w') as f:
        f.write(content)
EOF
echo "*****apps.py"
# Update settings.py to include new apps and PostgreSQL config
docker compose -f docker-compose.dev.yml run --rm backend python << 'EOF'
import re

with open('config/settings.py', 'r') as f:
    content = f.read()

# Add apps
content = content.replace(
    "'django.contrib.staticfiles',",
    "'django.contrib.staticfiles',\n    'apps.accounts' "
)

# Add os import if not present
if 'import os' not in content:
    content = 'import os\n' + content

# Replace default SQLite DATABASES with PostgreSQL
content = re.sub(
    r"DATABASES = \{.*?^\}",
    """DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv("DB_NAME", "dogwalker"),
        'USER': os.getenv("DB_USER", "postgres"),
        'PASSWORD': os.getenv("DB_PASS", "de339552e1db31b3bc979c0deeb9ed5d"),
        "HOST": os.getenv("DB_HOST", "db"),
        "PORT": os.getenv("DB_PORT", "5432"),
    }
}""",
    content,
    flags=re.DOTALL | re.MULTILINE
)

with open('config/settings.py', 'w') as f:
    f.write(content)
EOF
echo "*****settings"
# Generate requirements.txt in backend directory
docker compose -f docker-compose.dev.yml run --rm backend pip freeze > backend/requirements.txt

# Start all services now that config exists
docker compose -f docker-compose.dev.yml up -d

# npm install zod

echo "***Django project created successfully***"
