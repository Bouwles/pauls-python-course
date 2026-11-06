---
id: predict-else
type: predict
title: Good answers only
concept: try-except
code: |
  for text in ["4", "four"]:
      try:
          weeks = float(text)
      except ValueError:
          print(text, "isn't a number")
      else:
          print(text, "weeks")
question: What does this print?
options:
  - text: |-
      4 weeks
      four isn't a number
    correct: true
    feedback: "On the first pass `float(\"4\")` works, so the `else` runs. On the second it fails, so the `except` runs and the `else` is skipped."
  - text: |-
      4 weeks
      four isn't a number
      four weeks
    misconception: else-runs-always
    feedback: "The `else` doesn't run every time. When the `try` fails, only the `except` runs for that pass."
---
Two lots of weeks, typed two ways.
