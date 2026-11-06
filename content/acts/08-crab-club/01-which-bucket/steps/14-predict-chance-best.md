---
id: predict-chance-best
type: predict
title: Counting the winners
concept: exploration-exploitation
code: |
  import numpy as np

  samples = np.array([[0.21, 0.30],
                      [0.18, 0.12],
                      [0.25, 0.31],
                      [0.19, 0.40]])
  best = np.argmax(samples, axis=1)
  print(np.bincount(best, minlength=2).tolist())
question: What does this print?
options:
  - text: "[1, 3]"
    correct: true
    feedback: "Right. Screen 1 drew the bigger rate in the first, third and fourth rows, screen 0 only in the second. So screen 1 is the best in 3 draws of 4, a chance of 0.75."
  - text: "[3, 1]"
    misconception: bincount-backwards
    feedback: "`np.bincount` counts how many times each number appears in `best`. Position 0 of the answer is how often screen 0 won: once, in the second row."
  - text: "[0, 0, 1, 1]"
    misconception: axis-names-what-remains
    feedback: "That would be `axis=0`, the best row in each column, counted. `axis=1` looks along each row, so each draw names its winning screen."
---
Four draws, two screens. Each row is one draw: a plausible rate for each screen. Find the winner of each row, then count.
