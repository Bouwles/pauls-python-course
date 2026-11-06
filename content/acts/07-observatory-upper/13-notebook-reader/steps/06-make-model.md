---
id: make-model
type: make
title: The network
files: [notes.py, baseline.py, model.py]
entry: model.py
starter_from: make-baseline
on_pass: { aaesha.proud: "6.60 on notes it never saw, against the bigram's 10.73. Four characters back is worth having." }
hints:
  nudge: "Write the shape beside every line of `forward`, then go back up through `backward` with the same shapes. Which shape must `d_flat` become before it can reach `E`?"
  plan:
    - "init_model: E, W1, b1, W2, b2, small and random, from a seeded rng"
    - "forward: look up each window's embeddings and lay them in a row"
    - A tanh layer, then a score for every character, then softmax
    - "backward: chances minus the answers, then back through each layer"
    - Each embedding gets the blame from every place its character appeared
    - "train: a batch of rows, forward, the loss, backward, a step"
    - "model_chances: the chance of each real next character"
  shape: |
    def backward(X, y, params, cache):
        flat, H, P = cache["flat"], cache["H"], cache["P"]
        d_scores = P.copy()
        d_scores[np.arange(len(y)), y] -= ___
        d_scores /= len(y)
        d_W2 = ___ @ d_scores
        d_Z = (d_scores @ params["W2"].T) * (1 - ___)
        d_W1 = ___ @ d_Z
        d_flat = d_Z @ ___
        d_E = np.zeros_like(params["E"])
        np.add.at(d_E, X, d_flat.reshape(___))
        ...
---
Write `model.py`. `save_params` and `load_params` are written; `CONTEXT`, `DIM` and `HIDDEN` are 4, 10 and 64. The forward pass is the last step's, three lines:

```python
flat = E[X].reshape(len(X), -1)      # (n, 4, 10) to (n, 40)
H = np.tanh(flat @ W1 + b1)          # (n, 64)
P = softmax(H @ W2 + b2)             # (n, 55)
```

`init_model` draws from `rng = np.random.default_rng(seed)`, in this order: `E` from `rng.normal(0, 1, ...)`, `W1` from `rng.normal(0, 1 / np.sqrt(context * dim), ...)`, `W2` from `rng.normal(0, 1 / np.sqrt(hidden), ...)`, both biases at zero. `train` makes one rng from `seed`, and each step takes a mini-batch, `rows = rng.integers(0, len(X), batch)`.

```text
Steps 1900 to 1999: loss 1.484
Held-back notes: perplexity 6.60, bigram 10.73, guessing 55
Saved my_weights.json
```

The checks measure your gradients against nudged ones, train for 200 steps, and score Aaesha's trained weights.
