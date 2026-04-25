from django.urls import path
from .views import WeatherNoteView


urlpatterns = [
    path('', WeatherNoteView.as_view()),
]
