---
id: predict-captain
type: predict
title: The stairs light
concept: perceptron
dialogue:
  - neil.neutral.point: "The stairs light. A switch at the top, a switch at the bottom. Both up or both down, it's on."
  - neil.pleased: "Anything else, it's off. One neuron can learn that, surely."
code: |
  import numpy as np

  # The stairs light: top switch up?, bottom switch up?
  settings = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
  light_on = [1, 0, 0, 1]

  weights = np.zeros(2)
  bias = 0.0
  mistakes = []
  for epoch in range(1000):
      wrong = 0
      for setting, label in zip(settings, light_on):
          guess = 1 if np.dot(weights, setting) + bias > 0 else 0
          error = label - guess
          weights = weights + 0.1 * error * setting
          bias = bias + 0.1 * error
          wrong += abs(error)
      mistakes.append(wrong)

  print("Fewest mistakes in one epoch:", min(mistakes))
question: "A thousand epochs on the stairs light's four settings. What does it print?"
options:
  - text: "Fewest mistakes in one epoch: 0"
    misconception: perceptron-learns-anything
    feedback: "No straight line puts the two corners where the light is on on one side and the other two on the other. One neuron draws one straight line, so it never has a clean epoch, however long it sweeps."
  - text: "Fewest mistakes in one epoch: 1"
    misconception: perceptron-finds-best-line
    feedback: "A straight line could get three of the four right, but the perceptron rule doesn't look for the best line. On a rule it can't learn, it lurches from line to line forever."
  - text: "Fewest mistakes in one epoch: 3"
    correct: true
    feedback: "Right, and that's worse than always saying yes. Each mistake drags the line towards one corner and away from another, round and round. One neuron draws one straight line; this rule needs two."
after: |
  Run it, then print `mistakes[:12]` to watch it go round.
---
One neuron draws one straight line through the readings: yes on one side, no on the other. Here is the same learning rule on the stairs light.

Plot its four settings on a square. The two where the light is on sit at opposite corners.
