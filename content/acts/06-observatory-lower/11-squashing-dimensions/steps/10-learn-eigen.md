---
id: learn-eigen
type: learn
title: Directions that don't turn
concept: eigenvectors
code: |
  import numpy as np

  matrix = np.array([[5.0, 2.0],
                     [2.0, 2.0]])
  print(matrix @ np.array([1.0, 0.0]))

  values, vectors = np.linalg.eigh(matrix)
  print(values.round(2))
  print(vectors[:, 1].round(2))
  print((matrix @ vectors[:, 1]).round(2), (values[1] * vectors[:, 1]).round(2))
---
Multiply an arrow by a matrix and it usually turns: `(1, 0)` comes out as `(5, 2)`, pointing somewhere new.

An **eigenvector** is an arrow that doesn't turn. The matrix only stretches it, by a number called its **eigenvalue**: `matrix @ v` is the same as `value * v`. The example's last line shows both sides matching.

For a covariance matrix, the eigenvectors are the directions the readings spread along, and each eigenvalue is how much they spread that way.

`np.linalg.eigh(matrix)` finds them. It gives the eigenvalues **smallest first**, here `[1. 6.]`, and each eigenvector as a **column**: `vectors[:, 1]` goes with `values[1]`. An arrow and its opposite are the same line, so it may hand either back.

The usual mistake is reading the eigenvectors as rows.
