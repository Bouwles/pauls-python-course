---
id: predict-returns
type: predict
title: What followed each tile
concept: monte-carlo
dialogue:
  - caitlin.pleased.point: "Three tiles along the top, then the finish. The perfect race."
code: |
  gamma = 0.5
  race = [((0, 0), "right", -1), ((0, 1), "right", -1), ((0, 2), "right", 10)]

  credited = []
  total = 0
  for tile, action, reward in reversed(race):
      total = reward + gamma * total
      credited.insert(0, (tile, total))

  for tile, sample in credited:
      print(tile, sample)
question: What does this print?
options:
  - text: |-
      (0, 0) 1.0
      (0, 1) 4.0
      (0, 2) 10.0
    correct: true
    feedback: "Right. Each tile gets the return from the moment the crab stood on it: its own reward and everything after, discounted from there. (0, 2) is one step from the prize, so it gets the full 10; (0, 0) pays for two steps first."
  - text: |-
      (0, 0) 1.0
      (0, 1) 1.0
      (0, 2) 1.0
    misconception: mc-whole-race-return
    feedback: "That credits every tile with the whole race's return, from the start. A tile can only take credit for what happened from the moment the crab stood on it. What came before isn't its doing."
  - text: |-
      (0, 0) 1.0
      (0, 1) 2.0
      (0, 2) 2.5
    misconception: mc-discount-from-start
    feedback: "That discounts each reward by how far it is from the start of the race. A tile's return starts counting from that tile: its own reward isn't discounted at all, the next is discounted once."
---
One race along the top, with `gamma` at 0.5 this time. `credited.insert(0, ...)` puts each tile at the front of the list, so they print in race order.
