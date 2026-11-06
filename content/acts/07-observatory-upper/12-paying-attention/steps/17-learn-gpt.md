---
id: learn-gpt
type: learn
title: Where each character sits
concept: transformers
code: |
  import numpy as np

  E = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]])     # one row per character: 'a', 'b', ' '
  P = np.array([[0.1, 0.0], [0.2, 0.0], [0.3, 0.0]])     # one row per position: 0, 1, 2
  CONTEXT = 3

  ids = [0, 2, 1, 0]                       # "a ba"
  window = ids[-CONTEXT:]                  # only the last CONTEXT characters fit
  X = E[window] + P[:len(window)]          # what each character is, plus where it sits
  print(window)
  print(X)
---
Attention alone doesn't know order: "dog bites man" and "man bites dog" would look the same. So each character starts as its embedding plus a **position embedding**, a learnt row for where it sits: `E[ids] + P[:len(ids)]`.

The position table has a fixed number of rows, the **context**: the most characters the model can see at once. To keep writing past it, use only the last `CONTEXT` characters, `ids[-CONTEXT:]`. In the example the context is 3, so the first character falls out of view.

Then the rows go through every block in turn, a final layer norm, and the **last** row, the newest character, gives a score for every character that could come next. Draw one, add it to the end, and go round again. That's a **GPT**.

The usual mistake is reading the scores off the first row.
