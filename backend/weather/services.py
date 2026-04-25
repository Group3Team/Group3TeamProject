import os
from google import genai
from .weather import get_hourly_weather_by_zip


class GemService:
    @staticmethod
    def generate_weather_note(zip_code):
        weather = get_hourly_weather_by_zip(zip_code)
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite-preview",
            contents=(
                f"Based on this hourly weather forecast: {weather}, "
                "write a single short notification note (1-2 sentences) answering is it is good dog walking weather?"
            ),
        )
        return response.text
