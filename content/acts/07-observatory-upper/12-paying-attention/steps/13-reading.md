---
id: reading-block
type: learn
title: One block
concept: transformers
dialogue:
  - neil.neutral.point: "Under the heads, two lines. I boxed them and wrote: one block. Stack them."
code: |
  import numpy as np


  def feed_forward(X, W1, b1, W2, b2):
      return np.maximum(0, X @ W1 + b1) @ W2 + b2      # a ReLU layer, then a second layer


  X = np.array([[1.0, 0.0],
                [0.0, 2.0]])                   # two characters
  W1, b1 = np.array([[1.0, -1.0, 0.5], [0.5, 1.0, -1.0]]), np.zeros(3)
  W2, b2 = np.full((3, 2), 0.1), np.zeros(2)

  change = feed_forward(X, W1, b1, W2, b2)
  print(np.round(change, 2))
  print(np.round(X + change, 2))               # the residual: add it to what came in
---
A **transformer** is a stack of blocks, and each block is two lines:

```text
X = X + multi_head(layer_norm(X, ...), heads, Wo)
X = X + feed_forward(layer_norm(X, ...), W1, b1, W2, b2)
```

First the characters look at each other, with multi-head attention. Then a **feed-forward** network, a ReLU layer and a second layer, thinks about each character's row on its own. Attention gathers; the feed-forward network thinks about what was gathered.

Each part's answer is added to what came in: `X = X + ...`, a **residual connection**. The block only has to work out a change, and blame flows straight back along the addition through a deep stack. In the example the feed-forward network's small change is added on to `X`.

The usual mistake is replacing `X` with each part's answer instead of adding it.
