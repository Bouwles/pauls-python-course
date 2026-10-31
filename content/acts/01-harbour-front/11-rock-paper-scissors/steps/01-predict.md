---
id: predict
type: predict
title: Keeping score
concept: dictionaries
code: |
  score = {"you": 0, "me": 0, "draw": 0}
  result = "me"
  score[result] = score[result] + 1
  print(score)
question: What does this print?
options:
  - text: "{'you': 0, 'me': 1, 'draw': 0}"
    correct: true
    feedback: "Right. `result` holds the text `\"me\"`, so `score[result]` is the `\"me\"` pigeonhole. Whatever `result` says decides which score goes up."
  - text: "{'you': 0, 'me': 0, 'draw': 0, 'result': 1}"
    misconception: printing-name-shows-name
    feedback: "Without quotes, `result` is a variable, and Python uses what it holds: `\"me\"`. Only `score[\"result\"]`, in quotes, would make a new key called result."
  - text: "{'you': 0, 'me': 0, 'draw': 0}"
    misconception: dict-existing-key-ignored
    feedback: "Giving a key that's already there a new value replaces the old one. `\"me\"` was 0, and now it's 1."
  - text: "{'you': 0, 'me': [0, 1], 'draw': 0}"
    misconception: dict-key-holds-many
    feedback: "A key holds one value. The new value replaces the old one; it isn't kept alongside it."
after: |
  Run it. Then change line 2 to `result = "draw"` and run it again.
---
The machine will keep score in a dictionary, with a key for each side and one for draws. Here the key is chosen by a variable.
