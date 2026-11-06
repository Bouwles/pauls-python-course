---
id: learn-activations
type: learn
title: Bend and squash
concept: activation-functions
code: |
  import numpy as np


  def relu(z):
      return np.maximum(0, z)


  def sigmoid(z):
      return 1 / (1 + np.exp(-z))


  sums = np.array([-3.0, 0.0, 2.0, 30.0])
  print(relu(sums))
  print(np.round(sigmoid(sums), 3))
---
Between layers, every neuron's total goes through an **activation function** before it's passed on.

**ReLU** bends: negative numbers become 0, and the rest pass straight through. `np.maximum(0, z)` compares 0 with every number and keeps the bigger. **Sigmoid** squashes any number into 0 to 1, as in the diabetes model. The example prints `[ 0.  0.  2. 30.]`, then `[0.047 0.5   0.881 1.   ]`.

Why bother? Without a bend, a layer of a layer is still one layer: multiplying by `W1` then by `W2` is the same as multiplying by one matrix, and one straight line. The bend between them is what lets two layers draw two lines.

The usual mistake is reaching for `np.max(z)`. That finds the biggest number in one array, a single number, not 0 or each entry.
