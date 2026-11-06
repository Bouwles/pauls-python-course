---
id: predict-dials
type: predict
title: Reading high
concept: chain-rule
code: |
  gain, offset = 1.0, 0.0
  reading, true = 12.0, 10.0
  miss = gain * reading + offset - true
  print(2 * miss * reading, 2 * miss)
question: What does this print?
options:
  - text: "48.0 4.0"
    correct: true
    feedback: "Right. It reads 2 degrees high, so the miss is 2. Both slopes are positive: turn both dials down."
  - text: "-48.0 -4.0"
    misconception: miss-sign-backwards
    feedback: "The miss is the corrected reading minus the true one: 12 - 10, which is 2, not -2. A thermometer reading high has a positive miss."
  - text: "4.0 4.0"
    misconception: chain-forgets-inner
    feedback: "The gain's slope has one more link: the miss changes by `reading`, 12, for each 1 the gain turns. So it's 2 times 2 times 12."
---
A thermometer that reads high instead.
