---
id: learn-pca
type: learn
title: The directions that matter most
concept: pca
code: |
  import numpy as np

  X = np.array([[96.0, 80.0],
                [100.0, 85.0],
                [104.0, 86.0],
                [108.0, 93.0]])

  centred = X - X.mean(axis=0)
  values, vectors = np.linalg.eigh(centred.T @ centred / (len(X) - 1))
  order = np.argsort(values)[::-1]               # biggest first
  values, vectors = values[order], vectors[:, order]
  print((values / values.sum()).round(3))
  print((centred @ vectors[:, 0]).round(1))
---
**Principal component analysis**, PCA, finds the directions the readings spread along, biggest first, so many readings can be squashed into a few numbers.

Centre each column, work out the covariance matrix, and find its eigenvectors. Those are the **principal components**: new directions that mix the original columns. Put them biggest first with `np.argsort(values)[::-1]`. Each eigenvalue's share of the total says how much of the spread its component **explains**.

To squash, multiply each centred row by a component, `centred @ vectors[:, 0]`: one number per customer instead of two. In the example, the first component explains `0.982` of the spread: chest and waist are nearly one measurement, overall size.

Like k-means, PCA learns from the readings alone, with no answers.

The usual mistake is thinking PCA picks the best of the original columns. Each component mixes them all.
