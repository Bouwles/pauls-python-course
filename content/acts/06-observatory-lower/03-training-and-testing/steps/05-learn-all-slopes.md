---
id: learn-all-slopes
type: learn
title: Every slope at once
concept: multivariate-regression
code: |
  import numpy as np

  X = np.array([[1.0, 2.0],
                [3.0, 0.0],
                [2.0, 1.0]])
  miss = np.array([0.5, -1.0, 2.0])

  print(2 * X.T @ miss / len(miss))
  print(2 * np.mean(miss * X[:, 0]), 2 * np.mean(miss * X[:, 1]))
---
With one column, the slope for `w` was `2 * mean(miss * x)`. With several, each weight has a slope of its own: the same sum, with its own column in place of `x`.

`X.T @ miss` works them all out at once. `X.T` is `X` turned on its side, the transpose, so each of its rows is one column of `X`, and `@` multiplies each by the misses and adds up. Dividing by the number of rows makes it a mean:

```text
dw = 2 * X.T @ miss / len(miss)
```

The example works out the two slopes both ways, and both lines say 1 and 2. The slope for `b` is still `2 * mean(miss)`.

The usual mistake is leaving out the `.T`. `X @ miss` tries to multiply 2 columns by 3 misses, and stops with a ValueError.
