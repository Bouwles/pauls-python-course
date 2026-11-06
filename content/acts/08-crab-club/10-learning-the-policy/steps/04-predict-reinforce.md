---
id: predict-reinforce
type: predict
title: A poor race
concept: policy-gradients
code: |
  import numpy as np


  def chances(prefs):
      weights = np.exp(prefs - prefs.max())
      return weights / weights.sum()


  prefs = np.zeros(3)
  action, ret = 1, -2.0                         # it went the middle way, and the race was worth -2
  prefs += 0.5 * ret * (np.eye(3)[action] - chances(prefs))
  print(prefs.round(2).tolist())
question: What does this print?
options:
  - text: "[0.33, -0.67, 0.33]"
    correct: true
    feedback: "Right. The gradient is `[-1/3, 2/3, -1/3]`, and 0.5 times -2 flips it. The move made loses preference, and the other two gain."
  - text: "[0.0, -0.67, 0.0]"
    misconception: policy-gradient-only-chosen
    feedback: "The minus-chances part touches every move on the tile. The other two each had a chance of a third, so they rise by a third."
  - text: "[-0.33, 0.67, -0.33]"
    misconception: reinforce-always-reinforces
    feedback: "The return is -2, so the step points the other way: the move made becomes less likely, not more."
---
Three moves, all equally likely at first. The crab went the middle way, and the race from there was worth -2.
