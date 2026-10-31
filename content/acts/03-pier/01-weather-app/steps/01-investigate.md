---
id: investigate
type: investigate
title: What came back
concept: json-module
dialogue:
  - yahya: "There's a 10K in Penzance on Tuesday. I asked Open-Meteo about it on Sunday and kept the reply."
code: |
  import json

  with open("forecast.json") as file:
      forecast = json.load(file)

  print(list(forecast))
  print(forecast["daily_units"])
  print(forecast["daily"]["time"])
tasks:
  - id: how-many-days
    prompt: "Run it. How many days does the forecast cover?"
    kind: answer
    accept: ["3", "three", "3 days", "three days"]
    feedback: "Three. `forecast[\"daily\"]` holds one list per field, and each list has one value for each day."
    wrong: "Count the dates in the last line of the output."
  - id: wind-unit
    prompt: "What unit is the wind speed in?"
    kind: answer
    accept: ["km/h", "kmh", "kilometres an hour", "kilometres per hour"]
    feedback: "km/h. The reply says what its own numbers mean, in `daily_units`. Always read that before you print a number for anyone."
    wrong: "Look for `wind_speed_10m_max` in the second line of the output."
  - id: no-snow
    prompt: "Add `print(forecast[\"daily\"][\"snowfall_sum\"])` at the end and run it. What kind of error stops it?"
    kind: answer
    accept: ["KeyError", "a KeyError", "key error"]
    feedback: "A `KeyError`. Yahya never asked about snow, so there's no `snowfall_sum` in the reply. A reply only holds what the URL asked for."
    wrong: "Read the last line of the traceback, before the colon."
  - id: day-by-day
    prompt: "Take out the snow line. Then print each day's date and its highest temperature on one line, like `2026-10-25 12.7`, by walking `time` and `temperature_2m_max` together with `zip`."
    kind: run
    tests: |
      TESTS = [
          output("Three days, each with its high", expect="2026-10-25 12.7\n2026-10-26 16.5\n2026-10-27 15.6", match="contains",
                 hint="for day, high in zip(forecast[\"daily\"][\"time\"], forecast[\"daily\"][\"temperature_2m_max\"]): then print both."),
      ]
    solution: |
      import json

      with open("forecast.json") as file:
          forecast = json.load(file)

      print(list(forecast))
      print(forecast["daily_units"])
      print(forecast["daily"]["time"])
      for day, high in zip(forecast["daily"]["time"], forecast["daily"]["temperature_2m_max"]):
          print(day, high)
---
`forecast.json` is a real reply from Open-Meteo's forecast service, saved so you can read it at your own pace: same question, same answer, every time you open it. `json.load` turns the JSON into what you already know: dictionaries, lists, numbers and text.

The reply keeps its days in columns, not rows. `forecast["daily"]["time"]` is a list of dates, and every other list in `daily` lines up with it, one value a day, the way the tailor's two lists did.
