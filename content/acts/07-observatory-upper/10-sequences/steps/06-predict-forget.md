---
id: predict-forget
type: predict
title: A gate on the memory
concept: lstm-gates
dialogue:
  - neil: "Last page. A second memory, kept apart, with a gate on it. I drew the gate as a sluice."
  - paul: "So the gate says how much to keep. Near one, it keeps nearly everything."
code: |
  import numpy as np

  h = 1.0           # a plain hidden state, holding a memory
  c = 1.0           # an LSTM's cell, holding the same memory
  forget = 0.95     # the forget gate: keep 95 percent each hour

  for hour in range(10):
      h = np.tanh(0.5 * h)      # no new readings: only the memory goes round
      c = forget * c            # and the input gate is shut

  print(round(float(h), 3), round(c, 3))
question: "Ten quiet hours. What does this print?"
options:
  - text: "0.001 0.599"
    correct: true
    feedback: "Right. Squeezed through tanh and a weight every hour, the plain memory is nearly gone. The cell only loses what the gate lets go: 0.95 to the tenth is about 0.6."
  - text: "0.001 0.0"
    misconception: forget-gate-forgets
    feedback: "Despite its name, a forget gate near 1 means keep. The cell is multiplied by 0.95 each hour, so most of it survives."
  - text: "0.599 0.599"
    misconception: tanh-keeps-memory
    feedback: "The plain memory goes through `tanh(0.5 * h)` each hour, which roughly halves it. Ten halvings leave almost nothing."
after: |
  Run it, then make it a hundred hours. Then set `forget = 0.5`.
---
An **LSTM** (long short-term memory) fixes the vanishing memory with a second state, the **cell** `c`, and **gates**: numbers from 0 to 1, made by sigmoids, that multiply what passes through them.

The **forget gate** says how much of the old cell to keep. The **input gate** says how much of a new candidate to add. The **output gate** says how much of the cell to show as the hidden state. The cell changes only by being multiplied by a gate and added to, never squashed through `tanh` hour after hour, so a memory can survive a long time, and so can the blame flowing back to it.
