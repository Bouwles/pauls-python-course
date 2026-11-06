---
id: predict-bootstrap
type: predict
title: Drawn with putting back
concept: ensembles
code: |
  import numpy as np

  rng = np.random.default_rng(0)
  rows = rng.integers(0, 1000, 1000)
  print(round(len(np.unique(rows)) / 1000, 2))
question: "What share of the thousand rows turn up at least once in the sample?"
options:
  - text: "0.62"
    correct: true
    feedback: "Right. About 63 in 100 rows turn up, some of them more than once, and the other 37 are left out. That's what makes each tree's view of the data its own."
  - text: "1.0"
    misconception: bootstrap-is-shuffle
    feedback: "Each draw puts the row back, so the same row can come up again and some never come up. A bootstrap sample isn't a shuffle."
  - text: "0.5"
    misconception: bootstrap-is-half
    feedback: "A bootstrap sample draws as many rows as the data has, not half. It's the repeats that leave some out: about 37 in 100."
---
A bootstrap sample of a thousand rows, the way each tree in a forest gets its own. `np.unique` keeps each row number once.
