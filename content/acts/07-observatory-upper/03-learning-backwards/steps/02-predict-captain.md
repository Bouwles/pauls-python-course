---
id: predict-captain
type: predict
title: The captain's rule
concept: perceptron
dialogue:
  - ferro: "Flood tide and a sea breeze, we cross. Ebb and a land breeze, we cross."
  - ferro: "Anything else, we don't. Your neuron can learn that, I take it."
code: |
  import numpy as np

  # Captain Ferro's crossings: flood tide?, sea breeze?
  crossings = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
  sails = [1, 0, 0, 1]

  weights = np.zeros(2)
  bias = 0.0
  mistakes = []
  for epoch in range(1000):
      wrong = 0
      for crossing, label in zip(crossings, sails):
          guess = 1 if np.dot(weights, crossing) + bias > 0 else 0
          error = label - guess
          weights = weights + 0.1 * error * crossing
          bias = bias + 0.1 * error
          wrong += abs(error)
      mistakes.append(wrong)

  print("Fewest mistakes in one epoch:", min(mistakes))
question: "A thousand epochs on the captain's four crossings. What does it print?"
options:
  - text: "Fewest mistakes in one epoch: 0"
    misconception: perceptron-learns-anything
    feedback: "No straight line puts the two crossing corners on one side and the other two on the other. One neuron draws one straight line, so it never has a clean epoch, however long it sweeps."
  - text: "Fewest mistakes in one epoch: 1"
    misconception: perceptron-finds-best-line
    feedback: "A straight line could get three of the four right, but the perceptron rule doesn't look for the best line. On a rule it can't learn, it lurches from line to line forever."
  - text: "Fewest mistakes in one epoch: 3"
    correct: true
    feedback: "Right, and that's worse than always saying yes. Each mistake drags the line towards one corner and away from another, round and round. One neuron draws one straight line; this rule needs two."
after: |
  Run it, then print `mistakes[:12]` to watch it go round.
---
One neuron draws one straight line through the readings: yes on one side, no on the other. Here is the same learning rule on the captain's crossings.

Plot the captain's four crossings on a square. The two that sail sit at opposite corners.
