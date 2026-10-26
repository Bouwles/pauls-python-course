import json

FOUR_DAYS = json.dumps({
    "daily": {
        "time": ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05"],
        "temperature_2m_max": [9.8, 11.2, 8.4, 10.6],
    }
})

TESTS = [
    output("Three days, three lines", expect="2026-10-25: up to 13°C\n2026-10-26: up to 16°C\n2026-10-27: up to 16°C", visible=True),
    output("Another forecast, four days", files={"forecast.json": FOUR_DAYS},
           expect="2026-11-02: up to 10°C\n2026-11-03: up to 11°C\n2026-11-04: up to 8°C\n2026-11-05: up to 11°C",
           hint="One line per day, each date with its own high. zip walks the two lists side by side."),
]
