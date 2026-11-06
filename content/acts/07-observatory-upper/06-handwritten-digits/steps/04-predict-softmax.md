---
id: predict-softmax
type: predict
title: Too sure to count
concept: classification-networks
dialogue:
  - neil.thinking: "Some of the scores will be large. I'd like chances anyway."
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
Softmax, written without the shift, on three big scores for one digit.
