---
id: learn-lstm
type: learn
title: A gate on the memory
concept: lstm-gates
code: |
  import numpy as np

  c = 2.0                               # the cell: the long memory
  forget, inp, out = 0.9, 0.2, 0.5      # three gates, each from 0 to 1
  candidate = 0.8                       # something new to remember

  c = forget * c + inp * candidate      # keep most of the old, add a little new
  h = out * np.tanh(c)                  # show half of it as the hidden state
  print(round(c, 2), round(float(h), 3))
---
An **LSTM**, short for long short-term memory, keeps a second memory beside the hidden state: the **cell**, `c`. It's controlled by **gates**: numbers from 0 to 1, made by sigmoids, that multiply whatever passes through them.

The **forget gate** says how much of the old cell to keep: near 1 means keep. The **input gate** says how much of a new **candidate** to add. The **output gate** says how much of the cell to show as the hidden state:

```text
c = forget * c + inp * candidate
h = out * np.tanh(c)
```

The cell is only multiplied by a gate and added to, never squashed every step, so a memory, and the blame flowing back to it, can last a long time. In the example the cell keeps most of its 2.0.

The usual mistake is reading the forget gate's number as how much to forget.
