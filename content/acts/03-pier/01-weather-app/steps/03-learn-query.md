---
id: learn-query
type: learn
title: The question goes in the URL
concept: web-apis
code: |
  from urllib.parse import urlencode

  FORECAST = "https://api.open-meteo.com/v1/forecast"
  query = urlencode({"latitude": 50.12, "longitude": -5.53, "forecast_days": 3})
  print(query)
  print(FORECAST + "?" + query)
---
A URL that asks a question has two parts. The address says which service: `https://api.open-meteo.com/v1/forecast`. After a `?` comes the **query string**, which says what you want to know, as `name=value` pairs joined by `&`.

Riya's program asks two questions this way: where Penzance is, then what its weather will be.

`urlencode`, from `urllib.parse`, builds the query string from a dictionary. It turns every value into text, and writes awkward characters, like spaces, in a form a URL can carry. The example prints `latitude=50.12&longitude=-5.53&forecast_days=3`, then the whole URL.

The usual slip is to glue the query string together by hand. A space in a place name then breaks the URL.
