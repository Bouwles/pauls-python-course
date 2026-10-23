---
id: predict-order
type: predict
title: First come, first served
concept: if-elif-else
code: |
  age = 70
  if age >= 16:
      print("Adult")
  elif age >= 65:
      print("Pensioner")
  else:
      print("Child")
question: What does this print?
options:
  - text: Adult
    correct: true
    feedback: "Right. 70 is at least 16, so the first branch runs and the rest are skipped. The pensioner test is never even asked."
  - text: Pensioner
    misconception: elif-picks-best-match
    feedback: "Python doesn't look for the best match. It takes the first test that is `True`, and `70 >= 16` is `True`."
  - text: |-
      Adult
      Pensioner
    misconception: elif-runs-all-true
    feedback: "Only one branch of an `if`, `elif`, `else` ever runs. Once a test is `True`, the rest are skipped."
after: |
  Run it. Then think about which test should come first.
---
Someone at the ferry office wrote the age bands in this order. The passenger is 70.
