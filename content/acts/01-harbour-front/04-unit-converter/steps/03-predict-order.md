---
id: predict-order
type: predict
title: First come, first served
concept: if-elif-else
code: |
  wind = 40
  if wind >= 17:
      print("Rough")
  elif wind >= 34:
      print("Gale")
  else:
      print("Calm")
question: What does this print?
options:
  - text: Rough
    correct: true
    feedback: "Right. 40 is at least 17, so the first branch runs and the rest are skipped. The gale test is never even asked."
  - text: Gale
    misconception: elif-picks-best-match
    feedback: "Python doesn't look for the best match. It takes the first test that is `True`, and `40 >= 17` is `True`."
  - text: |-
      Rough
      Gale
    misconception: elif-runs-all-true
    feedback: "Only one branch of an `if`, `elif`, `else` ever runs. Once a test is `True`, the rest are skipped."
after: |
  Run it. Then think about which test should come first.
---
Someone at the ferry office wrote Ferro's wind bands in this order. A gale is 34 knots or more, and today the wind is 40.
