# Pip's pier board. Every day's high, from the saved forecast.
import json

with open("forecast.json") as file:
    forecast = json.load(file)

daily = forecast["daily"]
for day, high in zip(daily["time"], daily["temperature_2m_max"]):
    print(f"{day}: up to {round(high)}°C")
