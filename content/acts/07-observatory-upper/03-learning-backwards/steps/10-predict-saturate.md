---
id: predict-saturate
type: predict
title: Sure, and wrong
concept: backpropagation
dialogue:
  - yahya.pleased: "Easy one. Big mistake, big gradient. It'll fix itself in one step."
code: |
  import numpy as np


  def sigmoid(z):
      return 1 / (1 + np.exp(-z))


  z = 8.0
  p = sigmoid(z)           # the neuron is sure: 0.9997
  target = 0.0             # and it is wrong

  d_p = 2 * (p - target)   # blame arriving at p
  d_z = d_p * p * (1 - p)  # blame passed back through the sigmoid

  print(f"{d_p:.4f} {d_z:.4f}")
question: "The neuron says 0.9997 and the answer was 0. What does this print?"
options:
  - text: "1.9993 0.0007"
    correct: true
    feedback: "Right. Out at z = 8 the sigmoid is nearly flat: its slope, `p * (1 - p)`, is 0.0003. A confident mistake sends back almost nothing, so the weights barely move. Saturation again, this time on the way back."
  - text: "1.9993 1.9993"
    misconception: sigmoid-passes-blame-unchanged
    feedback: "Every link multiplies the blame by its own slope, the sigmoid included. Its slope here is `p * (1 - p)`, about 0.0003."
  - text: "1.9993 0.4998"
    misconception: sigmoid-slope-constant
    feedback: "A quarter is the sigmoid's slope at z = 0, its steepest point. At z = 8 it has flattened almost completely, so the blame shrinks to 0.0007."
after: |
  Run it, then try `z = 1.0`. This is why networks start with small random weights: big sums saturate before they've learned anything.
---
The blame arriving at `p` is large, nearly 2. Now pass it back through the sigmoid, using the rule from the board: `dZ2 = dP * P * (1 - P)`.
