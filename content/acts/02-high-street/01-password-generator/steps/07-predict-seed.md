---
id: predict-seed
type: predict
title: The same every time
concept: random-module
code: |
  import random

  random.seed(2026)
  monday = random.randint(1000, 9999)
  tuesday = random.randint(1000, 9999)

  random.seed(2026)
  next_week = random.randint(1000, 9999)

  print(monday == tuesday, monday == next_week)
question: What does this print?
options:
  - text: "False True"
    correct: true
    feedback: "Right. After a seed, `random` deals the same numbers in the same order. Monday and Tuesday differ, but seed it again and next week gets Monday's number back."
  - text: "True True"
    misconception: seeded-generator-repeats
    feedback: "The seed fixes the whole sequence, not one number. Each call takes the next number in it, so Monday and Tuesday differ."
  - text: "False False"
    misconception: seed-changes-nothing
    feedback: "The same seed always starts the same sequence. That's what a seed is for: next week starts again from Monday's number."
---
`random.seed(2026)` sets `random` back to a fixed starting point. It's how a game or a test gets the same "random" numbers every run.

Commit to an answer, then run it. Then think about what a seed would do to a locker code.
