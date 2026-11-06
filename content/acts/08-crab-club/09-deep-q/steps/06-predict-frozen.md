---
id: predict-frozen
type: predict
title: Is it frozen?
concept: dqn
code: |
  import numpy as np

  params = {"W": np.array([1.0, 2.0])}
  frozen = dict(params)

  params["W"] -= 0.5
  print(frozen["W"])
question: What does this print?
options:
  - text: "[0.5 1.5]"
    correct: true
    feedback: "Right. `dict(params)` is a new dictionary, but its value is the same array. `-=` changes that array in place, so the copy moved too. Copy each array: `{name: weights.copy() for name, weights in params.items()}`."
  - text: "[1. 2.]"
    misconception: copy-is-deep
    feedback: "`dict(params)` copies the dictionary, not what's inside it. Both dictionaries hold the same array, and `-=` changes that array in place."
---
A different way of making the frozen copy. Training changes `params["W"]` in place, as `train_step` will.
