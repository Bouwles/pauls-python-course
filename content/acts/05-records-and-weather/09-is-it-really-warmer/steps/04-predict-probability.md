---
id: predict-probability
type: predict
title: One or two
concept: probability
code: |
  import numpy as np

  rng = np.random.default_rng(4)
  rolls = rng.integers(1, 7, size=10_000)
  print(round((rolls <= 2).mean(), 1))
question: What does this print?
options:
  - text: "0.3"
    correct: true
    feedback: "Right. Two faces of six are 1 or 2, a chance of one in three. Ten thousand rolls land close to 0.33, which rounds to 0.3."
  - text: "0.5"
    misconception: probability-two-outcomes-even
    feedback: "Either it's a 1 or 2, or it isn't, but those aren't equally likely. Two faces of the six count, so it's about a third."
  - text: "0.7"
    misconception: probability-counts-the-rest
    feedback: "That's the share of rolls that were 3 or more. `rolls <= 2` is `True` for the ones and twos, about a third."
---
Ten thousand dice, and the share that came up 1 or 2.
