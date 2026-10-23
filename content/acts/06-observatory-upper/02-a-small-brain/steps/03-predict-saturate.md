---
id: predict-saturate
type: predict
title: Metres and knots
concept: activation-functions
dialogue:
  - wendt: "Her log gives visibility in metres and wind in knots. I put them straight in. Was that wrong? Don't answer."
code: |
  import numpy as np


  def sigmoid(z):
      return 1 / (1 + np.exp(-z))


  weights = np.array([0.5, -0.8, 0.3])         # visibility, wind, tide
  bias = -1.0
  evenings = np.array([[3000.0, 12.0, 4.1],    # metres, knots, metres
                       [200.0, 30.0, 5.2],
                       [50.0, 2.0, 1.0]])

  print(sigmoid(evenings @ weights + bias))
question: "A clear evening, a gale, and thick fog. What does this print?"
options:
  - text: "[1. 1. 1.]"
    correct: true
    feedback: "Right. The sums are about 1490, 77 and 23. Past about 10, sigmoid is so flat that it gives 1.0 to every digit NumPy shows. Clear, gale and fog look identical. That's saturation, and it's why readings are scaled to 0 to 1 before they go in."
  - text: "Three different numbers between 0 and 1, highest for the clear evening"
    misconception: sigmoid-keeps-big-inputs-apart
    feedback: "Sigmoid only spreads numbers out near 0. A sum of 23 and a sum of 1490 both land on 1.0: the differences are squashed out of existence."
  - text: "An OverflowError from np.exp"
    misconception: exp-overflow-crashes
    error: OverflowError
    feedback: "`np.exp(-1490)` is far too small for a float, so NumPy quietly gives 0.0, and 1 / (1 + 0) is 1.0. No crash: that's what makes saturation easy to miss."
after: |
  Run it. Then divide visibility by 3000 and wind by 40 before they go in, and run it again.
---
Penhallow's readings in the Make are each scaled from 0 to 1. These aren't.
