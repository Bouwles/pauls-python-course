---
id: predict-sweeps
type: predict
title: Two sweeps
concept: policy-evaluation
code: |
  # A practice corridor: four tiles, the finish at the right-hand end.
  # The crab always goes right, and never slips.
  values = [0.0, 0.0, 0.0, 0.0]      # tile 3 is the finish

  for sweep in range(2):
      for tile in range(3):
          reward = 10 if tile + 1 == 3 else -1
          future = 0.0 if tile + 1 == 3 else 0.9 * values[tile + 1]
          values[tile] = reward + future

  print([round(value, 1) for value in values])
question: What does this print?
options:
  - text: "[-1.9, 8.0, 10.0, 0.0]"
    correct: true
    feedback: "Right. Each sweep carries news of the finish one tile further back. After the first, only tile 2 knows about it. After the second, tile 1 does: -1 + 0.9 × 10 = 8. Tile 0 read tile 1 before tile 1 had heard, so it's still -1 + 0.9 × -1. A third sweep would give it 6.2."
  - text: "[6.2, 8.0, 10.0, 0.0]"
    misconception: news-travels-instantly
    feedback: "That's where the values end up, but not after two sweeps. Tile 0 is updated first in each sweep, from tile 1's old value, so the finish's news reaches it one sweep later."
  - text: "[-1.0, -1.0, 10.0, 0.0]"
    misconception: value-is-next-reward
    feedback: "That's after one sweep, when every value was still 0, so each tile got only its next reward. The second sweep adds 0.9 times the value of the tile ahead, which is no longer 0."
---
The corridor from the Learn step, stopped after two sweeps. Each sweep goes left to right. Trace it by hand, one sweep at a time.
