---
id: predict-query
type: predict
title: Asking with a URL
concept: web-apis
code: |
  from urllib.parse import urlencode

  query = urlencode({"name": "St Ives", "count": 1})
  print("https://geocoding-api.open-meteo.com/v1/search?" + query)
question: What does this print?
options:
  - text: "https://geocoding-api.open-meteo.com/v1/search?name=St+Ives&count=1"
    correct: true
    feedback: "A URL can't hold a space, so `urlencode` writes it as `+`, and it puts `&` between the pairs. The 1 goes in as the text `1`: a URL is text from end to end."
  - text: "https://geocoding-api.open-meteo.com/v1/search?name=St Ives&count=1"
    misconception: url-keeps-spaces
    feedback: "A space would end the URL early, and the service would look up `St`. `urlencode` writes spaces and other awkward characters in a form a URL can carry."
  - text: An error, because 1 is a number
    misconception: query-needs-text
    error: TypeError
    feedback: "`urlencode` turns every value into text itself. Numbers are fine."
after: |
  Paste the URL into a new browser tab. The reply is the same kind of JSON as `forecast.json`.
---
`urlencode` writes a query string from a dictionary. Here it asks Open-Meteo's geocoding service, which finds places, where St Ives is.
