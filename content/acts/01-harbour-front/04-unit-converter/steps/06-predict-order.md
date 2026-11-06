---
id: predict-order
type: predict
title: First come, first served
concept: if-elif-else
code: |
  altitude = 100
  if altitude >= 50:
      print("Up high")
  elif altitude >= 100:
      print("Space")
  else:
      print("In the air")
question: What does this print?
options:
  - text: Up high
    correct: true
    feedback: "Right. 100 is at least 50, so the first block runs and the rest are skipped. The space test is never even asked."
  - text: Space
    misconception: elif-picks-best-match
    feedback: "Python doesn't look for the best match. It takes the first test that is `True`, and `100 >= 50` is `True`."
  - text: |-
      Up high
      Space
    misconception: elif-runs-all-true
    feedback: "Only one block of an `if`, `elif` and `else` ever runs. Once a test is `True`, the rest are skipped."
after: |
  Now run it. Which test should have come first?
---
Neil's first try at sorting rocket flights put the tests in this order. Space starts 100 km up, and this flight reached 100.
