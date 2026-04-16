from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse, JsonResponse
import os

# Import weather module from the correct location
from backend.weather import get_hourly_weather_by_zip

def index(request):
    try:
        # Check if we're running in Docker environment or local development
        build_path = os.path.join(settings.BASE_DIR, 'frontend', 'build', 'index.html')
        
        # If the file doesn't exist at the expected path, check for alternative locations
        if not os.path.exists(build_path):
            # Try to find index.html in a more flexible way
            import glob
            possible_paths = glob.glob(os.path.join(settings.BASE_DIR, '**', 'build', 'index.html'), recursive=True)
            if possible_paths:
                build_path = possible_paths[0]
        
        with open(build_path) as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        # Provide a more helpful error message
        return HttpResponse("Frontend build not found. Please ensure the React app has been built and is available at frontend/build/index.html.", status=501)
    except Exception as e:
        return HttpResponse(f"Error serving frontend: {str(e)}", status=500)

def weather_api(request):
    """API endpoint to get hourly weather by zip code"""
    zip_code = request.GET.get('zip')
    
    if not zip_code:
        return JsonResponse({'error': 'Zip code parameter is required'}, status=400)
        
    try:
        result = get_hourly_weather_by_zip(zip_code)
        if isinstance(result, list):
            # Return the weather data
            return JsonResponse({
                'zip_code': zip_code,
                'weather_data': result[:12]  # First 12 hours as before
            })
        else:
            # Return error message from function
            return JsonResponse({'error': result}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Failed to fetch weather data: {str(e)}'}, status=500)