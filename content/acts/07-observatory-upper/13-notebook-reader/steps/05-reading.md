---
id: window
type: learn
title: Four characters in
concept: embeddings
dialogue:
  - neil.pleased: "My favourite network before the transformer. Four characters in, one guess out."
code: |
  import numpy as np

  X = np.array([0, 2, 0])                 # character 0 turns up twice
  pieces = np.array([1.0, 5.0, 2.0])      # the blame for each place it turned up

  looks_right = np.zeros(3)
  looks_right[X] += pieces                # the second 0 overwrites the first
  added = np.zeros(3)
  np.add.at(added, X, pieces)             # every piece added in
  print(looks_right, added)
---
The network looks up each character of a window in `E`, as in the Text Generator, and lays the four embeddings end to end in one row: `E[X].reshape(len(X), -1)`. Then a tanh layer, a score for every character, and softmax.

Backward is the blackboard again, with one new step at the end. The blame arriving at that row is cut back into four embeddings, and each goes to its character's row of `E`. A character can turn up twice in a window and hundreds of times in a batch, so its pieces must be added up.

`np.add.at(d_E, X, pieces)` adds every piece in, repeats included. In the example character 0 turns up twice, and gets `3.0`.

The usual mistake is `d_E[X] += pieces`. It looks the same, but a repeated character keeps only one piece: `2.0`.
