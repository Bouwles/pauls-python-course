---
id: window
type: reading
title: Four characters in
dialogue:
  - neil.pleased: "My favourite network before the transformer. Four characters in, one guess out."
code: |
  flat = E[X].reshape(len(X), -1)      # (n, 4, 10) to (n, 40): a window's embeddings in a row
  H = np.tanh(flat @ W1 + b1)          # (n, 64)
  P = softmax(H @ W2 + b2)             # (n, 55): the chances of every next character
---
The bigram looks one character back. This network looks four back. Each character of a window is looked up in `E`, as in the Text Generator, and the four embeddings are laid end to end in one row. Then a tanh layer, then a score for every character, then softmax.

Backward is the blackboard again, with one new step at the end. The blame arriving at `flat` is cut back into four embeddings per window, and each goes to its character's row of `E`. A character can turn up twice in a window and hundreds of times in a batch, so the pieces must be added up:

```python
np.add.at(d_E, X, d_flat.reshape(X.shape[0], X.shape[1], -1))
```

`np.add.at` adds every piece in, repeats included. `d_E[X] += ...` looks the same, but keeps only one piece for each repeated character.
