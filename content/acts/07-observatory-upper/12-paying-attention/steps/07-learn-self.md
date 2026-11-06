---
id: learn-self
type: learn
title: Queries, keys and values from the same rows
concept: attention
code: |
  import numpy as np

  X = np.array([[1.0, 0.0, 1.0],      # three characters, three numbers each
                [0.0, 1.0, 0.0],
                [1.0, 1.0, 0.0]])
  Wq = np.ones((3, 2))                # learnt, like any other weights
  Wk = np.eye(3)[:, :2]
  Wv = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]])

  Q, K, V = X @ Wq, X @ Wk, X @ Wv    # all three from the same characters
  print(Q.shape, K.shape, V.shape)
  print(V)
---
Where do the queries, keys and values come from? In **self-attention**, from the characters themselves.

Each character arrives as a row of numbers, its embedding, and the rows make `X`. Three weight matrices, learnt like any others, turn each row into the three things it needs: `Q = X @ Wq`, its question; `K = X @ Wk`, its label; and `V = X @ Wv`, what it hands over. Then attention, with the causal mask.

So the network learns what each character should ask about and what it should offer. Nobody tells it that a full stop should look for the last vowel; if it helps, it learns to.

The usual mistake is thinking the keys and values come from somewhere else. In self-attention, everything comes from `X`.
