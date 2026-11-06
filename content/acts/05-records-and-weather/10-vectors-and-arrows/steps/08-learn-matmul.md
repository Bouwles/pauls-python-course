---
id: learn-matmul
type: learn
title: Many dot products at once
concept: matrices
code: |
  import numpy as np

  winds = np.array([[3.0, 4.0],
                    [0.0, 12.0]])
  directions = np.array([[0.0, 1.0],     # north
                         [1.0, 0.0]])    # east
  print(winds @ directions.T)
---
A **matrix** is a two-dimensional array of numbers. `A @ B` multiplies two matrices: each row of `A` meets each column of `B` in a dot product, and entry `[i, j]` of the answer is row `i` dotted with column `j`. So the inner sizes must match, and they get used up:

```text
(n, k) @ (k, m)  gives  (n, m)
```

`M.T` is the **transpose**: rows turned into columns. With one arrow per row, `winds @ directions.T` dots every wind with every one-knot direction at once.

The example prints `[[ 4.  3.] [12.  0.]]`: each wind's north part, then its east part.

The usual slip is to swap the sides. `A @ B` and `B @ A` are different sums, and often only one of them fits.
