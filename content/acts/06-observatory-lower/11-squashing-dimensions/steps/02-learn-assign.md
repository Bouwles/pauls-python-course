---
id: learn-assign
type: learn
title: Every point to every centre
concept: k-means
code: |
  import numpy as np

  points = np.array([[0.0, 0.0], [1.0, 0.0], [5.0, 5.0]])
  centres = np.array([[0.0, 0.0], [5.0, 4.0]])

  print(points[:, np.newaxis, :].shape, centres[np.newaxis, :, :].shape)
  gaps = points[:, np.newaxis, :] - centres[np.newaxis, :, :]
  distances = np.linalg.norm(gaps, axis=2)
  print(distances.round(2))
  print(distances.argmin(axis=1))
---
With many customers and several columns, the join-the-nearest step wants every point's distance to every centre, as a table: one row per point, one column per centre.

`np.newaxis` adds an axis of size 1. `points[:, np.newaxis, :]` has shape `(3, 1, 2)` and `centres[np.newaxis, :, :]` has shape `(1, 2, 2)`. Subtracting broadcasts the 1s, so every point meets every centre: shape `(3, 2, 2)`, one gap of two numbers for each pair.

`np.linalg.norm(gaps, axis=2)` turns each gap into its length, leaving a `(3, 2)` table of distances. `.argmin(axis=1)` gives, for each row, the position of its smallest distance: each point's nearest centre. The example prints `[0 0 1]`.

The usual mistake is `argmin(axis=0)`, which gives each centre's nearest point instead.
