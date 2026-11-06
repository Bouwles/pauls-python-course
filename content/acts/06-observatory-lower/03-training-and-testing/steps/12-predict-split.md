---
id: predict-split
type: predict
title: A fifth for testing
concept: train-test-split
code: |
  import numpy as np

  rng = np.random.default_rng(178)
  order = rng.permutation(357)
  test_count = round(357 * 0.2)
  test, train = order[:test_count], order[test_count:]
  print(len(test), len(train))
question: What does this print?
options:
  - text: "71 286"
    correct: true
    feedback: "Right. A fifth of 357 is 71.4, which rounds to 71. The other 286 are for training, and no student is in both."
  - text: "71 357"
    misconception: test-also-trains
    feedback: "The two slices share nothing. `order[test_count:]` starts where the test rows stop, so the training set is everyone else: 286."
  - text: "286 71"
    misconception: split-slices-swapped
    feedback: "`order[:test_count]` is the first 71 shuffled rows, and those are the test rows here. The rest, 286, are for training."
---
All 357 students, with a fifth locked away for testing.
