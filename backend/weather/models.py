from django.db import models


class WeatherNote(models.Model):
    zip_code = models.CharField(max_length=255, default="84062")
    note = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    
