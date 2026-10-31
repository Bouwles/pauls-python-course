---
id: reading
type: reading
title: The real request
dialogue:
  - aaesha: "Open-Meteo asks for two things in return. Credit it, and don't hammer it."
code: |
  def fetch_json(url):
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
---
`fetch_json` is in your starter, written for you. On the workbench your Python runs inside the browser, so it asks through the browser with Pyodide's `pyxhr`. On your own computer the same function uses `urllib.request` from the standard library. Either way, a request that can't get through, or one the service turns down, raises an `OSError`.

Open-Meteo needs no key. In return it asks for credit wherever its numbers are shown, which is the last line of every forecast, and fewer than 10,000 requests a day from anyone using it free.

While you build, set `OFFLINE = True`. Then `fetch_json` reads the saved replies in this folder instead, and you get the same answer every run, with or without the internet. Set it back to `False` to see this week's weather.
