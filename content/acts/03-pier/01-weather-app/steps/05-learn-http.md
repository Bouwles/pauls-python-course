---
id: learn-http
type: learn
title: Request and response
concept: http-basics
code: |
  from http import HTTPStatus
  from urllib.parse import parse_qs, urlsplit

  url = urlsplit("https://api.open-meteo.com/v1/forecast?latitude=50.12&forecast_days=3")
  print(url.path)
  print(parse_qs(url.query))
  for status in [200, 404, 429]:
      print(status, HTTPStatus(status).phrase)
---
Fetching a URL sends a **request**: a method, `GET` for "send me this", then the path and the query string. The service sends back a **response**: a **status code** saying how it went, and a body, here the JSON.

The first digit is the news: 2 for success, like 200; 4 for a problem with the request, like 404, not found; 5 for trouble at the server. Finding nothing is still a success: the place search says 200, and leaves out `results`.

Everything in a URL is text. `parse_qs` reads a query string back, and the 3 comes back as `'3'`. The example prints the path, the query, and three statuses.

The usual slip is to expect numbers back from a URL. Convert them yourself.
