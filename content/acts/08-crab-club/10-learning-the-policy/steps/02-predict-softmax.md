---
id: predict-softmax
type: predict
title: Chances from preferences
concept: policy-gradients
code: |
  import numpy as np


  def chances(prefs):
      weights = np.exp(prefs - prefs.max())
      return weights / weights.sum()


  prefs = np.array([0.0, 0.0, 2.0, 0.0])
  print(chances(prefs).round(2).tolist())
question: What does this print?
options:
  - text: "[0.1, 0.1, 0.71, 0.1]"
    correct: true
    feedback: "Right. e to the 2 is about 7.4, and each 0 gives 1, so the total is 10.4. Left gets 7.4 of it, 0.71; the others get 0.1 each. The crab still tries them three times in ten."
  - text: "[0.0, 0.0, 1.0, 0.0]"
    misconception: softmax-picks-biggest
    feedback: "That's always taking the biggest. The softmax gives every move a share: e to the 0 is 1, not 0, so each of the others keeps about a tenth."
---
One tile, four preferences, with left preferred by 2. Work out e to the power of each, then each one's share of the total.
