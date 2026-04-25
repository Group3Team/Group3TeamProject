from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import WeatherNote
from .serializers import WeatherNoteSerializer
from .services import GemService
from .weather import get_hourly_weather_by_zip

CACHE_MINUTES = 60


class WeatherNoteView(APIView):
    def get(self, request):
        weather_note, _ = WeatherNote.objects.get_or_create(
            id=1, defaults={"zip_code": "84062"}
        )

        # Regenerates note if more than CACHE_MINUTES
        stale = (
            not weather_note.note
            or weather_note.updated_at < timezone.now() - timedelta(minutes=CACHE_MINUTES)
        )
        if stale:
            try:
                weather_note.note = GemService.generate_weather_note(weather_note.zip_code)
                weather_note.save()
            except Exception as e:
                print(f"Generate note failed: {e}")

        forecast = get_hourly_weather_by_zip(weather_note.zip_code)
        forecast_data = forecast[:12] if isinstance(forecast, list) else []

        serializer = WeatherNoteSerializer(weather_note)
        return Response({
            **serializer.data,
            "forecast": forecast_data,
        })
