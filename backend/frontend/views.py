from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse
import os

def index(request):
    try:
        with open(os.path.join(settings.BASE_DIR, 'frontend', 'build', 'index.html')) as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        return HttpResponse("Frontend build not found. Please run 'npm run build' in the frontend directory.", status=501)