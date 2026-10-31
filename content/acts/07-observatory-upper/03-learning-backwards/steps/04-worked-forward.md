---
id: worked-forward
type: worked
title: Two lines for the stairs light
dialogue:
  - neil: "On the back of the page, the stairs light. Solved. Two neurons, then one."
  - paul: "Every number given. Follow it through."
code: |
  import numpy as np


  def relu(z):
      return np.maximum(0, z)


  def sigmoid(z):
      return 1 / (1 + np.exp(-z))


  # The stairs light, one row each: top switch up?, bottom switch up?
  settings = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])

  # Layer one: two neurons, two straight lines
  W1 = np.array([[1.0, 1.0],
                 [1.0, 1.0]])
  b1 = np.array([0.0, -1.0])
  hidden = relu(settings @ W1 + b1)        # (4, 2): a row per setting

  # Layer two: one neuron that weighs the two lines
  W2 = np.array([[-4.0],
                 [8.0]])
  b2 = np.array([2.0])
  chance = sigmoid(hidden @ W2 + b2)       # (4, 1)

  print(np.round(chance.ravel(), 2))
  print(chance.ravel() > 0.5)
subgoals:
  - label: "Bend and squash: the two activations"
    lines: [4, 9]
  - label: "Lay out the batch: one row per example"
    lines: [12, 13]
  - label: "Layer one: multiply, add the bias, bend"
    lines: [15, 19]
  - label: "Layer two: multiply, add the bias, squash"
    lines: [21, 25]
  - label: Read off the answers
    lines: [27, 28]
explain:
  prompt: "Take `relu` off line 19, so `hidden = settings @ W1 + b1`. Why can no choice of weights do the stairs light then?"
  answer: "Without the bend, layer two just multiplies layer one again: (X @ W1 + b1) @ W2 + b2 is X @ (W1 @ W2) plus a constant, which is one layer, one straight line. The stairs light needs two lines, and the bend between the layers is what keeps them from merging into one."
  concept: activation-functions
---
**ReLU** bends: negative numbers become 0, the rest pass straight through. **Sigmoid** squashes any number into 0 to 1, as in your logistic regression downstairs. Functions like these, applied between layers, are **activation functions**.

The first hidden neuron counts how many of the two are on. The second fires only when both are. Layer two says yes when neither or both are on. `b1` has one bias per hidden neuron and NumPy adds it to every row.
