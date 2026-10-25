---
id: make
type: make
title: Reading her hand
files: [digits.py, training.py]
entry: digits.py
timeout_ms: 60000
on_pass: { wendt: "It read her shopping list. Eggs, four. Lamp oil, two. Biscuits, nine. That's a lot of biscuits." }
hints:
  nudge: "Softmax and cross-entropy end the brain now, instead of a sigmoid and squared error. What is the blame at the scores, and what stays the same behind it?"
  plan:
    - "one_hot: a row of the identity matrix for each label"
    - "Softmax: shift by the row's biggest, exponentiate, divide by the row's total"
    - "Cross-entropy: minus the log of the chance given to the right answer"
    - "Scores: one column per digit, then softmax"
    - "Blame at the scores: chances minus the one-hot answers, over n"
    - Then back through the layers, as in Learning Backwards
    - "Read off the answer: the biggest column"
    - "train: for each epoch, for each batch, forward, backward, step; then note the loss on every row"
  shape: |
    def one_hot(labels, classes):
        return np.eye(___)[labels]


    def softmax(Z):
        shifted = Z - Z.max(axis=___, keepdims=True)
        exps = np.exp(shifted)
        return exps / exps.sum(axis=1, keepdims=___)


    def cross_entropy(P, labels):
        return -np.mean(np.log(P[np.arange(len(P)), ___]))


    def backward(X, labels, params, cache):
        Z1, H, P = cache["Z1"], cache["H"], cache["P"]
        dZ2 = (P - one_hot(labels, P.shape[1])) / ___
        dZ1 = (dZ2 @ params["W2"].T) * ___
        return {"W1": ___, "b1": ___, "W2": ___, "b2": ___}


    def accuracy(P, labels):
        return np.mean(P.argmax(axis=___) == labels)
---
Teach the brain to read in `digits.py`. The comments are the subgoals from Mira's parcels; `training.py` is Moss's copy of Training Properly.

```
Loss: 0.543 after the first epoch, 0.029 after the last
Read 293 of 297 digits it had never seen
Misread: 4 as 7, 9 as 5, 9 as 8, 8 as 1
```

The program flattens each 8 by 8 digit into a row of 64 greys and divides by 16. It shuffles the digits once, with a fixed seed, and locks 297 in the drawer: the brain learns from the other 1500 and sees the 297 only at the end.

The first run fetches scikit-learn, which takes a moment. The checks measure your gradients against nudged ones, then train a brain from a different shuffle and expect it to read at least 95% of its held-back digits.
