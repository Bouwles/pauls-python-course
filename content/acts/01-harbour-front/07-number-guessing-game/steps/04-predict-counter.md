---
id: predict-counter
type: predict
title: Back to zero
concept: running-totals
code: |
  for guess in range(5):
      tries = 0
      tries = tries + 1
  print(tries)
question: What does this print?
options:
  - text: "1"
    correct: true
    feedback: "`tries = 0` is inside the loop, so it runs on every pass. Each pass sets it to 0 and adds 1, and the loop ends with `tries` at 1."
  - text: "5"
    misconception: total-reset-inside-loop
    feedback: "That's what it would print with `tries = 0` above the loop. Here that line is indented, so every pass wipes out the count before adding 1."
---
This is meant to count five tries. Read the indents carefully.
