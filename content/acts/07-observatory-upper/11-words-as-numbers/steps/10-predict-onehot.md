---
id: predict-onehot
type: predict
title: A row of the table
concept: embeddings
code: |
  import numpy as np

  E = np.array([[0.1, 0.9],     # " "
                [0.8, 0.2],     # "a"
                [0.7, 0.3],     # "e"
                [0.0, 1.0]])    # "s"

  e = np.array([0, 0, 1, 0])    # "e", as a one-hot row
  print(e @ E)
question: What does this print?
options:
  - text: "[0.7 0.3]"
    correct: true
    feedback: "Right. Every row of `E` is multiplied by 0 except the one where the 1 is, so a one-hot row times a matrix just picks out that row. It's the same as `E[2]`, only slower."
  - text: "[1.6 2.4]"
    misconception: onehot-sums-all
    feedback: "That adds every row up. The zeros switch the other rows off: only row 2, the 1's row, survives."
  - text: "[0.8 0.2]"
    misconception: onehot-position-from-one
    feedback: "The 1 is at index 2, counting from 0, which is the row for \"e\": the third row, not the second."
  - text: A ValueError
    misconception: onehot-shape-error
    error: ValueError
    feedback: "A row of 4 times a (4, 2) matrix lines up: the inner 4s match, and the answer has 2 numbers."
after: |
  Run it. Then print `E[2]`.
---
A small embedding table, one row per character, and the one-hot row for `"e"`.
