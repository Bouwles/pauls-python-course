---
id: predict-weights
type: predict
title: A little from every pigeonhole
concept: attention
code: |
  import numpy as np

  scores = np.array([2.0, 1.0, 0.0])            # how well each key matches the query
  weights = np.exp(scores) / np.exp(scores).sum()
  values = np.array([10.0, 20.0, 30.0])         # what each pigeonhole holds

  print(np.round(weights, 2))
  print(round(float(weights @ values), 1))
question: What does this print?
options:
  - text: |-
      [0.67 0.24 0.09]
      14.2
    correct: true
    feedback: "Right. The best match gets two thirds of the weight, but not all of it. The answer is a mix: mostly 10, some 20, a little 30."
  - text: |-
      [1. 0. 0.]
      10.0
    misconception: attention-picks-best
    feedback: "Softmax doesn't pick a winner. Every key gets some weight, more for a better match, so the answer is a blend of all the values."
  - text: |-
      [0.67 0.24 0.09]
      20.0
    misconception: attention-output-plain-average
    feedback: "The weights are right, but 20 is the plain average of the values. `weights @ values` weighs each value by its weight, so 10 counts most."
after: |
  Run it. Then double every score and run it again. Bigger differences make softmax pickier.
---
Softmax again: `np.exp` of each score, divided by their total. Here it turns three scores into three weights.
