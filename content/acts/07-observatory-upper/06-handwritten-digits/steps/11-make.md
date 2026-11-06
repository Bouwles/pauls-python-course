---
id: make
type: make
title: Reading handwriting
files: [digits.py, training.py]
entry: digits.py
timeout_ms: 60000
on_pass: { aaesha.proud: "Nearly ninety-nine per cent on digits it never saw. I wrote the bar at ninety-five before we started." }
hints:
  nudge: "Softmax and cross-entropy end the network now, instead of a sigmoid and squared error. What is the blame at the scores, and what stays the same behind it?"
  plan:
    - "one_hot: a row of the identity matrix for each label"
    - "Softmax: shift by the row's biggest, exponentiate, divide by the row's total"
    - "Cross-entropy: minus the log of the chance given to the right answer"
    - "Scores: one column per digit, then softmax"
    - "Blame at the scores: chances minus the one-hot answers, over n"
    - Then back through the layers, as in Neural Network from Scratch
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
Teach the network to read in `digits.py`. The comments are the steps from Paul's post, and `training.py` is Paul's copy of the Optimiser Benchmark: `init_params`, `batches` and `Adam`.

```text
Loss: 0.543 after the first epoch, 0.029 after the last
Read 293 of 297 digits it had never seen
Misread: 4 as 7, 9 as 5, 9 as 8, 8 as 1
```

The program flattens each digit into a row of 64 greys and divides by 16. It shuffles the digits once, with a fixed seed, and locks 297 away: the network learns from the other 1500, and sees the 297 only at the end.

The first run fetches scikit-learn, which takes a moment. The checks measure your gradients against nudged ones, then train from a different shuffle and expect at least 95% of the held-back digits read right.
