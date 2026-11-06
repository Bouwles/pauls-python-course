---
id: predict-insertion
type: predict
title: One lap slides
concept: simple-sorts
code: |
  laps = [3, 8, 5, 2]
  current = laps[2]
  slot = 2
  while slot > 0 and laps[slot - 1] > current:
      laps[slot] = laps[slot - 1]
      slot = slot - 1
  laps[slot] = current
  print(laps)
question: What does this print?
options:
  - text: "[3, 5, 8, 2]"
    correct: true
    feedback: "Right. The 5 is picked up, the 8 moves right, and the 5 stops beside the 3, which is faster. The 2 hasn't had its turn yet."
  - text: "[2, 3, 5, 8]"
    misconception: one-pass-sorts
    feedback: "This places one lap, the 5, and nothing else. The 2 at the end gets its own turn on a later pass."
  - text: "[5, 3, 8, 2]"
    misconception: insertion-slides-to-front
    feedback: "The slide stops at the first lap that's faster. The 3 is faster than the 5, so the 5 stops just after it."
---
One pass of insertion sort: the lap in position 2 slides into place.
