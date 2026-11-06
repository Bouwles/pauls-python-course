---
id: make
type: make
title: Make the weather app
files: [weather.py]
entry: weather.py
timeout_ms: 15000
on_pass: { riya.laughing: "I unplugged the router and asked about Penzance. It told me, politely, that nobody was answering." }
hints:
  nudge: "Which of your functions need the internet? Only `fetch_json` should. Everything else is handed a reply that has already arrived."
  plan:
    - Ask for the data in one place
    - "describe: look the code up, with a default"
    - "find_place: no results means None"
    - "forecast_url: the address, then urlencode"
    - Walk the lists of daily values together with zip
    - Turn each day into a line
    - Catch what can go wrong, by name
    - Print only once everything has arrived
  shape: |
    def describe(code):
        return WEATHER.get(code, ___)


    def find_place(reply):
        found = reply.get("results", ___)
        if not found:
            return ___
        place = found[0]
        parts = [place.get("name"), place.get("admin1"), place.get("country")]
        label = ", ".join(part for part in parts if ___)
        return label, place["latitude"], place["longitude"]


    def forecast_lines(forecast):
        daily = forecast["daily"]
        lines = []
        for when, code, low, high, rain, wind in zip(daily["time"], ___):
            day = date.fromisoformat(when)
            lines.append(f"{day:%a} {day.day} {day:%b}: ___")
        return lines


    def main():
        name = input("Where? ").strip()
        ...
        try:
            place = find_place(fetch_json(place_url(name)))
            ...
        except ___:
            print("Can't reach the weather service. Try again later.")
            return
        except KeyError as error:
            print(f"The forecast came back without {___}.")
            return
        ...
---
Write the functions from the brief in `weather.py`, under `place_url`. The comments are the steps from Paul's daylight board, with a few new ones.

`date.fromisoformat("2026-10-25")` turns a date in the reply into a `date`, and an f-string can show it the way Riya wants: `f"{day:%a} {day.day} {day:%b}"` gives `Sun 25 Oct`.

The checks never use the internet. They swap your `fetch_json` for one that answers from saved replies, or pretends the connection is down, then call your functions and `main` and read what comes out. So `main` must get every reply through `fetch_json`.

Run it with `OFFLINE = False` once it passes, and ask about somewhere you know.
