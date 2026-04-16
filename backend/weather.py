import requests
from datetime import datetime, timedelta

def get_hourly_weather_by_zip(zip_code):
    headers = {'User-Agent': '(MyWeatherApp, contact@example.com)'}
    
    try:
        # 1. Convert Zip to Lat/Lon
        geo_url = f"https://api.zippopotam.us/us/{zip_code}"
        geo_res = requests.get(geo_url, timeout=10)
        if geo_res.status_code == 404:
            return f"Error: Zip code {zip_code} not found."
        
        geo_data = geo_res.json()
        place = geo_data['places'][0]
        lat, lon = place['latitude'], place['longitude']
        
        # 2. Get NWS Grid Point
        nws_point_url = f"https://api.weather.gov/points/{lat},{lon}"
        point_res = requests.get(nws_point_url, headers=headers, timeout=10)
        point_data = point_res.json()
        
        # 3. Get HOURLY Forecast URL (Notice the change here)
        forecast_url = point_data['properties']['forecastHourly']
        forecast_res = requests.get(forecast_url, headers=headers, timeout=10)
        forecast_res.raise_for_status()
        
        return forecast_res.json()['properties']['periods']

    except requests.exceptions.RequestException as e:
        return f"Request failed: {e}"

if __name__ == "__main__":
    target_zip = input("Enter a US Zip Code: ").strip()
    periods = get_hourly_weather_by_zip(target_zip)
    
    if isinstance(periods, list):
        print(f"\n--- Next 12 Hours for {target_zip} ---")
        # Slice the first 12 periods (each period is 1 hour)
        for period in periods[:12]:
            # Format the timestamp for readability
            time_obj = datetime.fromisoformat(period['startTime'])
            time_str = time_obj.strftime("%I:%M %p")
            
            temp = f"{period['temperature']}°{period['temperatureUnit']}"
            desc = period['shortForecast']
            wind = f"{period['windSpeed']} {period['windDirection']}"
            
            print(f"[{time_str}] {temp} | {desc} (Wind: {wind})")
    else:
        print(periods)