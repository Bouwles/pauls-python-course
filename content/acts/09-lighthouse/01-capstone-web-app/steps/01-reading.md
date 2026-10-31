---
id: requests-and-answers
type: reading
title: How a web app answers
dialogue:
  - paul: "A web app is a function someone calls from across the city. That's most of it."
code: |
  # Lost property, as the marina office might keep it.
  from flask import Flask, jsonify, request

  app = Flask(__name__)
  LOST = []


  @app.get("/api/lost")
  def list_lost():
      return jsonify(LOST)


  @app.post("/api/lost")
  def report_lost():
      found = request.get_json(silent=True)
      if not isinstance(found, dict) or "item" not in found:
          return jsonify({"error": "Say what was found."}), 400
      LOST.append(found)
      return jsonify(found), 201


  # A pretend browser, for tests: no server needed.
  client = app.test_client()
  response = client.post("/api/lost", json={"item": "oilskin", "where": "Pontoon B"})
  print(response.status_code, response.get_json())
---
A browser, or `curl`, sends a **request**: a method (`GET` to ask, `POST` to send something new, `DELETE` to remove), a path such as `/api/lost`, and sometimes a body. The app sends back a **response**: a status code and a body. 200 means here it is; 201, made; 204, done, nothing to add. 400 means you sent it wrong; 404, nothing there; 409, it clashes with something.

APIs mostly speak **JSON**, text that looks like Python's dictionaries and lists. `jsonify` turns them into JSON, and `request.get_json()` turns JSON back.

In Flask, `@app.get("/api/lost")` above a function means: when this request arrives, call me. Whatever the function returns is the response, with a status if you give one.

`app.test_client()` sends pretend requests without starting a server, so pytest can check every route in a fraction of a second. This page's code runs at home, not here.
