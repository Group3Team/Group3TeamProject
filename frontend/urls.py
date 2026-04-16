from django.urls import path
from .views import index, weather_api

urlpatterns = [
    path('', index, name='home'),
    path('api/weather/', weather_api, name='weather-api'),
]