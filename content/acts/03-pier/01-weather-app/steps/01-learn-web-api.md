---
id: learn-web-api
type: learn
title: Asking another computer
concept: web-apis
code: |
  import json

  reply_text = '{"latitude": 50.12, "daily": {"time": ["2026-10-25"], "temperature_2m_max": [12.7]}}'
  reply = json.loads(reply_text)
  print(type(reply_text), type(reply))
  print(reply["daily"]["time"][0], reply["daily"]["temperature_2m_max"][0])
---
A **web API** is a program on someone else's computer that answers questions. You ask by fetching a URL, a web address, and the answer comes back as text, almost always JSON.

Riya's forecast will come from one: Open-Meteo, a free weather service.

The reply arrives as one long piece of text. `json.loads` turns it into dictionaries and lists, and from then on it's data like any other. The example prints the two types, then `2026-10-25 12.7`.

Keep the asking in one function, and give everything else replies that have already arrived. Then it can all be checked with a saved reply, and no internet.

The usual slip is to look things up in the text itself. Turn it into data first.
