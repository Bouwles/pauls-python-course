---
id: learn-layernorm
type: learn
title: Layer norm
concept: transformers
code: |
  import numpy as np

  X = np.array([[1.0, 2.0, 3.0, 4.0],          # one character's row
                [10.0, 10.0, 10.0, 50.0]])     # another

  mean = X.mean(axis=1, keepdims=True)         # one mean per row
  var = X.var(axis=1, keepdims=True)
  normed = (X - mean) / np.sqrt(var + 1e-5)
  print(np.round(normed, 2))
---
Between the parts of a transformer, each character's row is put back on a steady scale with **layer norm**. It's batch norm from the Seeing Forecaster, turned round.

Batch norm worked down each column, across a batch. Layer norm works along each row, one character on its own: take away the row's mean and divide by its spread, with `axis=1` and `keepdims=True`. Then multiply by a learnt gain and add a learnt shift. In the example each row comes out centred on 0, whatever size its numbers were.

Because it never looks across rows, it needs no batch: one character works fine, and nothing has to be remembered for later.

The usual mistake is normalising down the columns, as batch norm did.
