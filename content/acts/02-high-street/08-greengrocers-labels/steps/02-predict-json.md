---
id: predict-json
type: predict
title: Written as JSON
concept: json-module
code: |
  import json

  question = {"answer": "yellow", "also": None, "hard": False}
  print(json.dumps(question))
question: What does this print?
options:
  - text: "{'answer': 'yellow', 'also': None, 'hard': False}"
    misconception: json-looks-like-print
    feedback: "That's how `print` shows the dictionary itself. JSON text always uses double quotes, and writes `None` as `null` and `False` as `false`."
  - text: '{"answer": "yellow", "also": None, "hard": False}'
    misconception: json-looks-like-print
    feedback: "The quotes are right, but JSON has its own words: `null` for `None`, `false` for `False` and `true` for `True`."
  - text: '{"answer": "yellow", "also": null, "hard": false}'
    correct: true
    feedback: "Double quotes, `null` and `false`: that's JSON. `json.loads` turns it back into `None` and `False`."
---
One question from Caitlin's book, turned into JSON text.
