---
id: predict-order
type: predict
title: First come, first served
concept: if-elif-else
code: |
  km = 42
  if km >= 21:
      print("Long run")
  elif km >= 42:
      print("Marathon")
  else:
      print("Easy run")
question: What does this print?
options:
  - text: Long run
    correct: true
    feedback: "Right. 42 is at least 21, so the first branch runs and the rest are skipped. The marathon test is never even asked."
  - text: Marathon
    misconception: elif-picks-best-match
    feedback: "Python doesn't look for the best match. It takes the first test that is `True`, and `42 >= 21` is `True`."
  - text: |-
      Long run
      Marathon
    misconception: elif-runs-all-true
    feedback: "Only one branch of an `if`, `elif`, `else` ever runs. Once a test is `True`, the rest are skipped."
after: |
  Run it. Then think about which test should come first.
---
Yahya's first try at sorting his runs put the tests in this order. A marathon is 42 km or more, and today he ran 42.
