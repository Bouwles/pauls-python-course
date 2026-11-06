---
id: pieces
type: make
title: Make the pieces
files: [descent.py]
entry: descent.py
timeout_ms: 20000
on_pass: { paul.pleased: "ReLU, the smallest fit, and the error. Tested, all three. Now I trust them." }
hints:
  nudge: "With more features than examples, many sets of weights fit exactly. Which NumPy function picks the smallest, and still gives ordinary least squares when there are fewer features?"
  plan:
    - Multiply the inputs by the random weights
    - Keep the positives with relu
    - Fit with the pseudo-inverse
    - Average the squared misses
  shape: |
    def relu_features(X, W):
        return np.___(0, X @ W)


    def fit_min_norm(features, y):
        return np.linalg.___(features) @ y


    def mse(predicted, actual):
        return float(np.mean((___) ** 2))
---
Three pieces, in `descent.py`. Each is a line or two, and the whole curve stands on them:

1. `relu_features(X, W)`: the inputs times the random weights, with ReLU keeping the positives.
2. `fit_min_norm(features, y)`: the minimum-norm fit, with `np.linalg.pinv`. `np.linalg.lstsq(features, y, rcond=None)[0]` gives the same answer.
3. `mse(predicted, actual)`: the average of the squared misses, as a float.

Done: the checks fit with more and with fewer features than examples, and make sure the smallest exact fit really is the smallest.
