from rest_framework import serializers
from .models import WeatherNote


class WeatherNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherNote
        fields = ('id', 'zip_code', 'note', 'updated_at')
