---
id: learn-json
type: learn
title: Lists and dictionaries in a file
concept: json-module
code: |
  import json

  question = {"round": "Local", "answer": "yellow", "also": ("gold", "golden")}
  text = json.dumps(question)
  print(text)
  print(json.loads(text)["also"])
---
**JSON** is a way of writing lists and dictionaries as text, so they can be kept in a file or sent between programs.

Caitlin's questions are in a JSON file, `questions.json`.

The `json` module does the work. `json.load(file)` reads an open file and hands back the lists and dictionaries in it. `json.dump(value, file)` writes them to a file. `json.dumps(value)` and `json.loads(text)` do the same with a string.

JSON uses double quotes, and writes `True` as `true` and `None` as `null`. The example prints the dictionary as JSON text, then what came back for `also`: `['gold', 'golden']`.

The usual slip is to expect a tuple back. JSON has only lists, so a tuple comes back as a list.
