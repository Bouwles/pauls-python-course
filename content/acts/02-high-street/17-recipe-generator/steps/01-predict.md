---
id: predict-next
type: predict
title: One at a time
concept: iterators
code: |
  trays = iter(["loaf", "bun", "tart"])
  print(next(trays))
  print(next(trays))
  for tray in trays:
      print(tray)
question: What does this print?
options:
  - text: |-
      loaf
      bun
      tart
    correct: true
    feedback: "Right. `next` takes a value and moves on. The `for` loop carries on from where `next` left off, so only `tart` is left for it."
  - text: |-
      loaf
      bun
      loaf
      bun
      tart
    misconception: for-restarts-iterator
    feedback: "An iterator only goes forward. The `for` loop asks the same iterator for its next value, and `loaf` and `bun` have already been handed over."
  - text: |-
      loaf
      loaf
      loaf
      bun
      tart
    misconception: next-does-not-advance
    feedback: "`next` doesn't just look. It takes the value and moves past it, so the second `next` gets `bun`."
after: |
  Run it. Then put a fourth `print(next(trays))` at the very end and read the error.
---
`iter()` turns a list into an **iterator**: something that hands over its values one at a time. `next()` asks it for the next one.

A `for` loop does the same asking, over and over, until there's nothing left.
