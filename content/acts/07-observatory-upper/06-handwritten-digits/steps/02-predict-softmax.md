---
id: predict-softmax
type: predict
title: Too sure to count
concept: classification-networks
dialogue:
  - neil.thinking: "Ten scores, one per digit, from the last layer. Some of them will be large. I'd like chances."
code: |
  import numpy as np

  scores = np.array([1000.0, 1001.0, 998.0])
  chances = np.exp(scores) / np.exp(scores).sum()
  print(chances)
question: "Three scores for one digit. What does this print?"
options:
  - text: "[nan nan nan]"
    correct: true
    feedback: "Right. `np.exp(1000)` is too big for a float, so NumPy makes it infinity, and infinity over infinity is `nan`, not a number. Subtract the row's biggest score first: `[-1, 0, -3]` gives exactly the same chances, and nothing overflows."
  - text: "[0.25949646 0.70538451 0.03511903]"
    misconception: softmax-safe-for-big-scores
    feedback: "Those are the right chances, and you'd get them from `scores - scores.max()`. Straight in, `np.exp(1000)` overflows to infinity first, and the sum is infinity too."
  - text: "An OverflowError"
    misconception: exp-overflow-crashes
    error: OverflowError
    feedback: "NumPy doesn't stop the program. It warns, quietly makes the number infinity and carries on, which is how `nan` gets into a network without anyone noticing."
after: |
  Run it. Then change line 4 to use `scores - scores.max()` in both places.
---
**Softmax** turns a row of scores into chances: exponentiate each score, then divide by the row's total. Every chance is above 0 and they add up to 1. The biggest score gets the biggest chance, and a lead of 1 makes a score about 2.7 times as likely.

Downstairs, the sigmoid did this for two answers. Softmax does it for any number.
