---
id: predict-symmetry
type: predict
title: Sixteen of the same
concept: weight-initialisation
dialogue:
  - caitlin: "Random starting weights are messy. I start every weight at 0.5. Neat, and the same for everyone."
code: |
  import numpy as np

  # The stairs light, and a network whose every weight starts at 0.5
  X = np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]])
  T = np.array([[1.0], [0.0], [0.0], [1.0]])
  W1 = np.full((2, 3), 0.5)
  b1 = np.zeros(3)
  W2 = np.full((3, 1), 0.5)
  b2 = np.zeros(1)

  for step in range(2000):
      H = np.maximum(0, X @ W1 + b1)
      P = 1 / (1 + np.exp(-(H @ W2 + b2)))
      dZ2 = 2 * (P - T) / len(X) * P * (1 - P)
      dZ1 = (dZ2 @ W2.T) * (H > 0)
      W2 -= 2.0 * H.T @ dZ2
      b2 -= 2.0 * dZ2.sum(axis=0)
      W1 -= 2.0 * X.T @ dZ1
      b1 -= 2.0 * dZ1.sum(axis=0)

  print(np.round(W1, 2))
  print("Light on:", (P.ravel() > 0.5).astype(int))
question: "Three hidden neurons, every weight starting at 0.5, two thousand steps. What does it print?"
options:
  - text: |-
      [[1.2 1.2 1.2]
       [1.2 1.2 1.2]]
      Light on: [0 0 0 1]
    correct: true
    feedback: "Right. Three neurons that start the same compute the same thing, get the same blame and take the same step, every step, forever. Three neurons doing one neuron's work, and one neuron can't learn the stairs light. Small random weights break the tie."
  - text: |-
      [[-0.1  -3.54 -2.3 ]
       [-2.44  3.54  2.33]]
      Light on: [1 0 0 1]
    misconception: training-breaks-symmetry
    feedback: "That's what it prints from small random weights. From identical ones, nothing ever tells the three neurons apart: each gets exactly the same gradient as the others, so they move in step and stay identical."
  - text: |-
      [[0.5 0.5 0.5]
       [0.5 0.5 0.5]]
      Light on: [1 1 1 1]
    misconception: equal-start-never-moves
    feedback: "The weights do move: the gradients aren't 0. They just all move together, by the same amount, so they're still equal to each other at the end."
after: |
  Run it. Then start `W1` at `np.random.default_rng(2).normal(0, 1, (2, 3))` and run it again.
---
In Neural Network from Scratch the network started from small random numbers. Caitlin would like to know why.
