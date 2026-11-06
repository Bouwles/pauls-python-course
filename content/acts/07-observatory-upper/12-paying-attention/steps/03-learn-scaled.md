---
id: learn-scaled
type: learn
title: Every character asks at once
concept: attention
code: |
  import numpy as np


  def softmax(scores):
      exps = np.exp(scores - scores.max(axis=-1, keepdims=True))
      return exps / exps.sum(axis=-1, keepdims=True)


  Q = np.array([[1.0, 0.0], [0.0, 2.0], [1.0, 1.0]])    # one query per character
  K = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]])    # one key per character
  V = np.array([[1.0, 0.0], [0.0, 1.0], [5.0, 5.0]])    # one value per character

  scores = Q @ K.T / np.sqrt(K.shape[-1])     # every query against every key
  weights = softmax(scores)                   # one row per query
  print(np.round(weights, 2))
  print(np.round(weights @ V, 2))
---
With every character asking at once, the queries are the rows of a matrix `Q`, the keys the rows of `K`, and the values the rows of `V`.

`Q @ K.T` scores every query against every key in one go: one row per query, one column per key. Each score is divided by the square root of the key size, `np.sqrt(K.shape[-1])`. A dot product grows with the length of the rows, and without the division long rows give huge scores, and softmax would give almost all the weight to one key.

Then softmax along each row turns a query's scores into its weights, and `weights @ V` mixes the values: one answer per character. That's **scaled dot-product attention**.

The usual mistake is softmaxing down the columns. Each row is one query sharing its attention, so each row adds up to 1.
