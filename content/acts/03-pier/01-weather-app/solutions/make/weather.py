"""A plain three-day forecast, from Open-Meteo."""
import json
from datetime import date
from urllib.parse import urlencode

GEOCODING = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST = "https://api.open-meteo.com/v1/forecast"
DAILY = "weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max,wind_speed_10m_max"

# True: read the saved replies in this folder instead of asking the internet.
OFFLINE = False

# What the weather codes mean, from the World Meteorological Organization's table.
WEATHER = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Freezing fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    56: "Light freezing drizzle",
    57: "Freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light showers",
    81: "Showers",
    82: "Violent showers",
    85: "Light snow showers",
    86: "Snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
}


def fetch_json(url):
    """Ask a web service for url, and hand back its JSON as dictionaries and lists.

    Raises OSError, or one of its family, if the request can't get through
    or the service turns it down.
    """
    if OFFLINE:
        saved = "places.json" if url.startswith(GEOCODING) else "forecast.json"
        with open(saved) as file:
            return json.load(file)
    try:
        from pyodide.http import pyxhr  # on the workbench: ask through the browser
    except ImportError:
        from urllib.request import urlopen  # on your own computer
        with urlopen(url, timeout=10) as reply:
            return json.load(reply)
    reply = pyxhr.get(url)
    reply.raise_for_status()
    return reply.json()


def place_url(name):
    """The geocoding URL that looks a place up by its name."""
    return GEOCODING + "?" + urlencode({"name": name, "count": 1})


def describe(code):
    """The words for a weather code."""
    return WEATHER.get(code, f"Unknown weather (code {code})")


def find_place(reply):
    """(label, latitude, longitude) for the first place in a geocoding reply, or None."""
    found = reply.get("results", [])
    if not found:
        return None
    place = found[0]
    parts = [place.get("name"), place.get("admin1"), place.get("country")]
    label = ", ".join(part for part in parts if part)
    return label, place["latitude"], place["longitude"]


def forecast_url(latitude, longitude):
    """The forecast URL for three days at this place."""
    query = urlencode({
        "latitude": latitude,
        "longitude": longitude,
        "daily": DAILY,
        "timezone": "auto",
        "forecast_days": 3,
    })
    return FORECAST + "?" + query


def forecast_lines(forecast):
    """One line per day of a forecast reply. A missing field raises KeyError."""
    daily = forecast["daily"]
    # Walk the lists of daily values together with zip
    days = zip(
        daily["time"],
        daily["weather_code"],
        daily["temperature_2m_min"],
        daily["temperature_2m_max"],
        daily["precipitation_probability_max"],
        daily["wind_speed_10m_max"],
    )
    lines = []
    for when, code, low, high, rain, wind in days:
        # Turn each day into a line
        day = date.fromisoformat(when)
        lines.append(
            f"{day:%a} {day.day} {day:%b}: {describe(code)}, {round(low)} to {round(high)}°C, "
            f"{rain}% chance of rain, wind up to {round(wind)} km/h"
        )
    return lines


def main():
    name = input("Where? ").strip()
    if not name:
        print("Type the name of a place.")
        return
    # Catch what can go wrong, by name
    try:
        place = find_place(fetch_json(place_url(name)))
        if place is None:
            print(f"No place called {name}.")
            return
        label, latitude, longitude = place
        lines = forecast_lines(fetch_json(forecast_url(latitude, longitude)))
    except OSError:
        print("Can't reach the weather service. Try again later.")
        return
    except KeyError as error:
        print(f"The forecast came back without {error}.")
        return
    # Print only once everything has arrived
    print(label)
    for line in lines:
        print(line)
    print("Weather data by Open-Meteo.com")


if __name__ == "__main__":
    main()
