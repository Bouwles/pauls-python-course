---
id: learn-flask
type: learn
title: Routes in Flask
concept: decorators
---
**Flask** is a small library for web apps. It runs on your own computer, not here, so this one is to read.

```python
from flask import Flask, jsonify, request

app = Flask(__name__)


@app.post("/api/lost")
def report_lost():
    found = request.get_json(silent=True)
    if not isinstance(found, dict) or "item" not in found:
        return jsonify({"error": "Say what was found."}), 400
    return jsonify(found), 201


client = app.test_client()
response = client.post("/api/lost", json={"item": "oilskin"})
print(response.status_code, response.get_json())
```

`@app.post("/api/lost")` is a decorator: when that request arrives, call this function. `request.get_json(silent=True)` gives the JSON body, or `None` if there isn't any. Return a reply and, after a comma, its status.

`app.test_client()` sends pretend requests with no server, so pytest can check every route in a moment. The project builds its app in a function, `create_app(data_file)`, so each test can have an app of its own.
