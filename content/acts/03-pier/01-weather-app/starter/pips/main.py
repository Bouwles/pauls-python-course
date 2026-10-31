# Caitlin's board for the Makerspace screen. Every day's high, from the saved forecast.
import json

with open("forecast.json") as file:
    forecast = json.load(file)

daily = forecast["daily"]
for day in daily["time"]:
    for high in daily["temperature_2m_max"]:
        print(f"{day}: up to {round(high)}°C")
