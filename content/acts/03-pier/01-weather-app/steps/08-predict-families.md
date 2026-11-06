---
id: predict-families
type: predict
title: One family of errors
concept: exceptions
code: |
  from urllib.error import URLError

  try:
      raise URLError("no connection")
  except OSError:
      print("Can't reach the weather service.")
  except URLError:
      print("Bad address.")
  print("Carrying on.")
question: What does this print?
options:
  - text: |-
      Can't reach the weather service.
      Carrying on.
    correct: true
    feedback: "A `URLError` is a kind of `OSError`. Python tries the `except` clauses from the top and takes the first that fits, so the second never gets a look in."
  - text: |-
      Bad address.
      Carrying on.
    misconception: except-picks-best-match
    feedback: "Python doesn't hunt for the closest match. It goes down the `except` clauses in order and stops at the first one that fits, and `OSError` fits."
  - text: A URLError traceback
    misconception: except-needs-exact-type
    error: URLError
    feedback: "`except OSError` catches the whole family: `URLError`, `TimeoutError`, `ConnectionError` and the rest are all kinds of `OSError`."
---
Two `except` clauses, and an error that fits both.
