---
id: reading
type: reading
title: The same, in matrices
dialogue:
  - wendt: "The other half of the board. Same chain, but every number is now a whole array."
code: |
  # forward                      backward: the blame passed back
  Z1 = X @ W1 + b1
  H = relu(Z1)                   dZ1 = dH * (Z1 > 0)
  Z2 = H @ W2 + b2               dW2 = H.T @ dZ2
                                 db2 = dZ2.sum(axis=0)
                                 dH = dZ2 @ W2.T
  P = sigmoid(Z2)                dZ2 = dP * P * (1 - P)
  L = np.mean((P - T) ** 2)      dP = 2 * (P - T) / P.size

  # Read the backward column from the bottom up.
  # Layer one, dW1 and db1, follows the same pattern as layer two.
---
The brain from A Small Brain, with a loss on the end. `X` is a batch, one row per example, and `T` holds the right answers in the same shape as `P`.

`dP` means the gradient of the loss with respect to `P`. It always has the same shape as `P`, and `dW2` the same shape as `W2`: a gradient holds one slope for every number in the thing it belongs to.

Each rule is the paper method with arrays. Sigmoid's slope is `P * (1 - P)`. ReLU's is 1 or 0, so `(Z1 > 0)` lets blame through only where the neuron fired. A bias touches every row, so its share is summed over the rows.

When you don't know where the `.T` goes, write the shapes down. `dW2` must be (hidden, answers), and `H.T @ dZ2` is (hidden, n) @ (n, answers). Nothing else lines up.
