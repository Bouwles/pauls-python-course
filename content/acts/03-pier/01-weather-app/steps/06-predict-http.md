---
id: predict-http
type: predict
title: Three days, as text
concept: http-basics
code: |
  from urllib.parse import parse_qs

  query = parse_qs("latitude=50.12&forecast_days=3")
  days = query["forecast_days"][0]
  print(days * 2)
question: What does this print?
options:
  - text: "6"
    misconception: query-values-are-numbers
    feedback: "Everything in a URL is text, so `days` is `\"3\"`, and text times 2 is the text twice. `int(days) * 2` would give 6."
  - text: "33"
    correct: true
    feedback: "`days` is the text `\"3\"`, and text times 2 repeats it. A URL carries no numbers, only text that looks like them."
---
The query string from a forecast URL, read back.
