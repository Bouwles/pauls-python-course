---
id: pieces
type: make
title: Make the pieces
files: [descent.py]
entry: descent.py
timeout_ms: 20000
on_pass: { wendt: "Relu, the smallest fit, and the error. I trust all three. Well, I've tested all three." }
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
Three pieces, in `descent.py`. Each is a line or two; what matters is that each is right, because the whole curve stands on them.

`np.linalg.pinv`, the **pseudo-inverse**, does both of the jobs `fit_min_norm` needs: ordinary least squares when there are fewer features than examples, and the smallest exact fit when there are more. `np.linalg.lstsq(features, y, rcond=None)[0]` gives the same answer.

Solving the normal equations, `(F.T @ F) w = F.T @ y`, does not. Past the threshold `F.T @ F` has no inverse, and whatever comes back, if anything does, isn't the smallest fit.

The checks fit with more and with fewer features than examples, and make sure the smallest exact fit really is the smallest.
