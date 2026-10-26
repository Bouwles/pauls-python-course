GAPS = {
    "daily": {
        "time": ["2026-10-27", "2026-10-28"],
        "weather_code": [63, 63],
        "temperature_2m_min": [10.5, 9.2],
        "temperature_2m_max": [15.6, 13.8],
        "precipitation_probability_max": [96, None],
        "wind_speed_10m_max": [None, 30.4],
    }
}

TESTS = [
    function("A day with no wind, and a day with no chance of rain", call="forecast_lines", args=(GAPS,),
             expect=["Tue 27 Oct: Rain, 10 to 16°C, 96% chance of rain, wind not known",
                     "Wed 28 Oct: Rain, 9 to 14°C, chance of rain not known, wind up to 30 km/h"],
             visible=True),
    function("Days with everything still work", call="forecast_lines",
             args=({"daily": {"time": ["2026-10-31"], "weather_code": [0], "temperature_2m_min": [-1.4], "temperature_2m_max": [3.6],
                              "precipitation_probability_max": [0], "wind_speed_10m_max": [7.5]}},),
             expect=["Sat 31 Oct: Clear sky, -1 to 4°C, 0% chance of rain, wind up to 8 km/h"],
             hint="0 is a real chance of rain. Check for None with is None, not with if not rain."),
]
