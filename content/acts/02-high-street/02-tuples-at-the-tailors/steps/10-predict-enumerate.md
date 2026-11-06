---
id: predict-enumerate
type: predict
title: Where the count starts
concept: enumerate
code: |
  kit = ["shirt", "shorts", "socks"]
  for number, item in enumerate(kit):
      print(number, item)
question: What does this print?
options:
  - text: |-
      1 shirt
      2 shorts
      3 socks
    misconception: enumerate-starts-at-one
    feedback: "Without `start=1`, `enumerate` counts from 0, the way list positions do."
  - text: |-
      0 shirt
      1 shorts
      2 socks
    correct: true
    feedback: "It counts from 0 unless told otherwise. `enumerate(kit, start=1)` would number them 1, 2, 3."
  - text: |-
      shirt 0
      shorts 1
      socks 2
    misconception: enumerate-order-swapped
    feedback: "Each pair is the number, then the item. So `number` gets 0, 1, 2, and the line prints the number first."
---
The kit list for each player. There's no `start` this time.
