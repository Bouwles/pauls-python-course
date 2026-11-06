---
id: predict
type: predict
title: A loop inside a loop
concept: big-o
code: |
  parts = ["bolt", "brake-pad", "spring", "bolt"]
  checks = 0
  for first in parts:
      for second in parts:
          checks = checks + 1
  print(checks)
question: What does this print?
options:
  - text: "16"
    correct: true
    feedback: "Right. The whole inner loop runs again for every pass of the outer one: four passes of four. Twice the parts would mean four times the checks."
  - text: "8"
    misconception: nested-loops-add
    feedback: "That's four, then four more. But the inner loop doesn't run once after the outer one: it runs all the way through inside every outer pass. Four times four."
  - text: "4"
    misconception: inner-loop-runs-once
    feedback: "The inner loop starts again from the first part on every pass of the outer loop. So it runs four times per pass, not four times in all."
  - text: "6"
    misconception: nested-loop-skips-repeats
    feedback: "Six is the number of different pairs. These loops don't skip anything: each part meets every part, itself included, and every pair is met twice."
after: |
  Run it. Then add a fifth part and run it again: one more part, nine more checks.
---
Neil's spares check compares parts with each other. This is its skeleton, with the comparing taken out and a counter put in.
