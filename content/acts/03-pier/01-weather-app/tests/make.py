import json
from urllib.parse import parse_qs, urlsplit

DAILY = "weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max,wind_speed_10m_max"
CREDIT = "Weather data by Open-Meteo.com"
DOWN = "Can't reach the weather service. Try again later."

PENZANCE = [
    "Penzance, England, United Kingdom",
    "Sun 25 Oct: Light drizzle, 10 to 13°C, 90% chance of rain, wind up to 37 km/h",
    "Mon 26 Oct: Rain, 12 to 16°C, 100% chance of rain, wind up to 46 km/h",
    "Tue 27 Oct: Rain, 10 to 16°C, 96% chance of rain, wind up to 45 km/h",
    CREDIT,
]

TRESCO = {"results": [{"name": "Tresco", "latitude": 49.95, "longitude": -6.33, "country": "United Kingdom"}]}
NOTHING = {"generationtime_ms": 0.12}

# Two days either side of the end of October, a frost and a thunderstorm.
WINTER = {
    "daily": {
        "time": ["2026-10-31", "2026-11-01"],
        "weather_code": [0, 95],
        "temperature_2m_min": [-1.4, 6.5],
        "temperature_2m_max": [3.6, 11.5],
        "precipitation_probability_max": [0, 75],
        "wind_speed_10m_max": [7.5, 61.2],
    }
}
WINTER_LINES = [
    "Sat 31 Oct: Clear sky, -1 to 4°C, 0% chance of rain, wind up to 8 km/h",
    "Sun 1 Nov: Thunderstorm, 6 to 12°C, 75% chance of rain, wind up to 61 km/h",
]


def saved(name):
    with open(name) as file:
        return json.load(file)


class Service:
    """Stands in for the internet: answers from saved replies, and remembers what it was asked."""

    def __init__(self, place=None, forecast=None, down_for=()):
        self.place = place
        self.forecast = forecast
        self.down_for = down_for
        self.asked = []

    def __call__(self, url):
        self.asked.append(url)
        if url.startswith("https://geocoding-api.open-meteo.com/"):
            kind, reply = "place", self.place
        elif url.startswith("https://api.open-meteo.com/v1/forecast"):
            kind, reply = "forecast", self.forecast
        else:
            raise CheckFailed(f"fetch_json was asked for {url}, which is neither Open-Meteo's geocoding address nor its forecast address.")
        if kind in self.down_for:
            raise OSError("Network error: nobody is answering")
        return reply


def run_main(ctx, typed, make_service):
    """Import weather.py, swap fetch_json for a stand-in, run main() and return the printed lines."""
    module = ctx.module(inputs=[typed])
    session = ctx._open[-1]
    service = make_service()
    module.fetch_json = service
    mark = len(session.transcript.parts)
    module.main()
    printed = "".join(text for kind, text in session.transcript.parts[mark:] if kind == "out")
    return [line.rstrip() for line in printed.strip("\n").split("\n")] if printed.strip() else [], service


def expect_lines(lines, wanted, message):
    if lines != wanted:
        raise CheckFailed(message, expected="\n".join(wanted), actual="\n".join(lines))


def penzance(ctx):
    lines, service = run_main(ctx, "Penzance", lambda: Service(saved("places.json"), saved("forecast.json")))
    expect_lines(lines, PENZANCE, "With Open-Meteo's saved replies for Penzance, main should print the place, three days and the credit.")


def saved_lines(ctx):
    module = ctx.module()
    lines = module.forecast_lines(saved("forecast.json"))
    if lines != PENZANCE[1:4]:
        raise CheckFailed("forecast_lines(the saved forecast) should give these three lines.", expected="\n".join(PENZANCE[1:4]), actual="\n".join(map(str, lines)) if isinstance(lines, list) else repr(lines))


def winter_lines(ctx):
    module = ctx.module()
    lines = module.forecast_lines(WINTER)
    if lines != WINTER_LINES:
        raise CheckFailed("forecast_lines should give one line for each day it's handed.", expected="\n".join(WINTER_LINES), actual="\n".join(map(str, lines)) if isinstance(lines, list) else repr(lines))


def unknown_code(ctx):
    module = ctx.module()
    odd = json.loads(json.dumps(WINTER))
    odd["daily"]["weather_code"] = [42, 3]
    lines = module.forecast_lines(odd)
    if not isinstance(lines, list) or len(lines) != 2 or not lines[0].startswith("Sat 31 Oct: Unknown weather (code 42), ") or not lines[1].startswith("Sun 1 Nov: Overcast, "):
        raise CheckFailed("Each line uses describe, so a code that isn't in WEATHER says so.", expected="Sat 31 Oct: Unknown weather (code 42), ...", actual=repr(lines))


def no_days(ctx):
    module = ctx.module()
    empty = {"daily": {name: [] for name in ["time"] + DAILY.split(",")}}
    lines = module.forecast_lines(empty)
    if lines != []:
        raise CheckFailed("A forecast with no days in it gives an empty list.", expected="[]", actual=repr(lines))


def missing_field(ctx):
    module = ctx.module()
    broken = json.loads(json.dumps(WINTER))
    del broken["daily"]["wind_speed_10m_max"]
    try:
        module.forecast_lines(broken)
    except KeyError:
        return
    raise CheckFailed("With no wind_speed_10m_max in the reply, forecast_lines should let the KeyError out, for main to deal with.")


def the_url(ctx):
    module = ctx.module()
    url = module.forecast_url(49.95, -6.33)
    parts = urlsplit(str(url))
    address = f"{parts.scheme}://{parts.netloc}{parts.path}"
    if address != "https://api.open-meteo.com/v1/forecast":
        raise CheckFailed("The URL should start with the address in FORECAST, then a ?.", expected="https://api.open-meteo.com/v1/forecast?...", actual=str(url))
    asked = {key: values[0] for key, values in parse_qs(parts.query).items()}
    wanted = {"latitude": "49.95", "longitude": "-6.33", "daily": DAILY, "timezone": "auto", "forecast_days": "3"}
    if asked != wanted:
        raise CheckFailed("The query string should ask for exactly these.", expected=str(wanted), actual=str(asked))


def no_such_place(ctx):
    lines, service = run_main(ctx, "Lyonesse", lambda: Service(NOTHING, saved("forecast.json")))
    expect_lines(lines, ["No place called Lyonesse."], "When the geocoding reply has no results, main says so, and that's all.")
    if len(service.asked) != 1:
        raise CheckFailed("With no place found, there's nothing to ask the forecast service about.", expected="1 request", actual=f"{len(service.asked)} requests")


def connection_down(ctx):
    lines, _ = run_main(ctx, "Penzance", lambda: Service(saved("places.json"), saved("forecast.json"), down_for=("place", "forecast")))
    expect_lines(lines, [DOWN], "When fetch_json raises an OSError, main prints one plain line instead of a traceback.")


def forecast_down(ctx):
    lines, _ = run_main(ctx, "Penzance", lambda: Service(saved("places.json"), saved("forecast.json"), down_for=("forecast",)))
    expect_lines(lines, [DOWN], "The place was found but the forecast never came. Nothing else should be printed: not even the place.")


def missing_in_main(ctx):
    def without_wind():
        broken = saved("forecast.json")
        del broken["daily"]["wind_speed_10m_max"]
        return Service(saved("places.json"), broken)

    lines, _ = run_main(ctx, "Penzance", without_wind)
    expect_lines(lines, ["The forecast came back without 'wind_speed_10m_max'."], "A reply without one of the fields gets one line that names it.")


def nothing_typed(ctx):
    lines, service = run_main(ctx, "   ", lambda: Service(saved("places.json"), saved("forecast.json")))
    expect_lines(lines, ["Type the name of a place."], "Nothing typed, or only spaces, gets one line.")
    if service.asked:
        raise CheckFailed("With no name, there's no point asking the internet.", expected="no requests", actual=f"{len(service.asked)} requests")


def tidy_name(ctx):
    lines, service = run_main(ctx, "  Tresco ", lambda: Service(TRESCO, WINTER))
    expect_lines(lines, ["Tresco, United Kingdom"] + WINTER_LINES + [CREDIT], "Tresco has no admin1 in its reply, so its label is the name and the country.")
    name = parse_qs(urlsplit(service.asked[0]).query).get("name", [""])[0]
    if name != "Tresco":
        raise CheckFailed("Strip the spaces off the name before looking it up.", expected="Tresco", actual=repr(name))
    asked = parse_qs(urlsplit(service.asked[1]).query)
    if asked.get("latitude") != ["49.95"] or asked.get("longitude") != ["-6.33"]:
        raise CheckFailed("The forecast should be asked for at the place that was found.", expected="latitude=49.95, longitude=-6.33", actual=service.asked[1])


TESTS = [
    custom("A forecast for Penzance, from the saved replies", penzance, visible=True,
           hint="Python's round() takes a half to the even number: round(10.5) is 10 and round(16.5) is 16. Use round(), as the brief says."),
    custom("No such place as Lyonesse", no_such_place, visible=True,
           hint="find_place returns None when the reply has no results. main checks for None and stops there."),
    function("describe a clear sky", call="describe", args=(0,), expect="Clear sky"),
    function("describe a code that isn't in WEATHER", call="describe", args=(42,), expect="Unknown weather (code 42)",
             hint="WEATHER.get(code, default) gives the default when the code isn't a key."),
    function("find_place with the saved reply", call="find_place", args=({"results": [{"name": "Penzance", "latitude": 50.11861, "longitude": -5.53715, "country": "United Kingdom", "admin1": "England", "admin2": "Cornwall"}]},),
             expect=("Penzance, England, United Kingdom", 50.11861, -5.53715)),
    function("find_place takes the first of several", call="find_place",
             args=({"results": [{"name": "Penzance", "latitude": 34.9, "longitude": -110.25, "country": "United States", "admin1": "Arizona"}, {"name": "Penzance", "latitude": 50.1, "longitude": -5.5, "country": "United Kingdom", "admin1": "England"}]},),
             expect=("Penzance, Arizona, United States", 34.9, -110.25)),
    function("find_place with no admin1", call="find_place", args=(TRESCO,), expect=("Tresco, United Kingdom", 49.95, -6.33),
             hint="Leave out any part that's missing, and the comma that would have gone with it. place.get(\"admin1\") gives None when it isn't there."),
    function("find_place when nothing was found", call="find_place", args=(NOTHING,), expect=None,
             hint="A reply with no results key means nothing was found. reply.get(\"results\", []) gives an empty list to check."),
    function("find_place with an empty list of results", call="find_place", args=({"results": []},), expect=None),
    custom("forecast_url asks for the right things", the_url,
           hint="Build the query string with urlencode from a dictionary: latitude, longitude, daily, timezone and forecast_days."),
    custom("forecast_lines with the saved forecast", saved_lines),
    custom("forecast_lines across the end of the month", winter_lines,
           hint="day.day is the day of the month as a number, so 1 November is 1, not 01. -1.4 rounds to -1, 3.6 to 4 and 7.5 to 8."),
    custom("forecast_lines with a code it doesn't know", unknown_code),
    custom("forecast_lines with no days", no_days),
    custom("forecast_lines with a field missing", missing_field,
           hint="Don't catch the KeyError inside forecast_lines. Let it out, and catch it in main, where there's someone to tell."),
    custom("No connection at all", connection_down,
           hint="fetch_json raises an OSError when it can't get through. Catch OSError in main, around both requests."),
    custom("The forecast fails after the place is found", forecast_down,
           hint="Print the place's label only once the forecast has arrived, so a failure leaves nothing half printed."),
    custom("A field missing from the forecast", missing_in_main,
           hint="except KeyError as error: then str(error) is the missing key, quotes and all."),
    custom("Nothing typed", nothing_typed,
           hint="Strip what's typed. If nothing's left, say so and return before calling fetch_json."),
    custom("Spaces round the name, and a place with no region", tidy_name),
]
