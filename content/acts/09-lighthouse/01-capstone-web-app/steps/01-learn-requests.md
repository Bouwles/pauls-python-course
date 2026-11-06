---
id: requests-and-answers
type: learn
title: How a web app answers
concept: http-basics
dialogue:
  - paul.neutral.point: "A web app is a function someone calls from across the city. That's most of it."
code: |
  import json

  LOST = []


  def report_lost(body):
      """What POST /api/lost does: check what was sent, then answer with a status and JSON."""
      if not isinstance(body, dict) or "item" not in body:
          return 400, json.dumps({"error": "Say what was found."})
      LOST.append(body)
      return 201, json.dumps(body)


  print(report_lost({"item": "oilskin", "where": "Pontoon B"}))
  print(report_lost("oilskin"))
---
In the Weather App you sent requests. Now you'll answer them. Each request has a method: `GET` to ask for something, `POST` to send something new, `DELETE` to remove it. Its path, like `/api/lost`, says what it's about, and a `POST` usually carries a JSON body.

The app answers with a status code and a body. 200 means here it is; 201, made; 204, done, with nothing to add. 400 means the request was wrong; 404, nothing there; 409, it clashes with something already there. A refusal still answers in JSON, with the reason in words.

The example is one route as a plain function: it prints `201` and the item, then `400` and the reason.

The usual mistake is answering 200 with an error in the body. Programs read the status first.
