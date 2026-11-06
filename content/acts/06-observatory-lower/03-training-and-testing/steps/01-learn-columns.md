---
id: learn-columns
type: learn
title: One dial per column
concept: multivariate-regression
dialogue:
  - paul.neutral.point: "The first-term grade says a lot. Absences say a bit more. One dial each."
code: |
  import numpy as np

  # Two students: first-term grade, and absences
  X = np.array([[12.0, 4.0],
                [15.0, 0.0]])
  w = np.array([0.9, -0.1])     # one weight for each column, in order
  b = 1.5

  print(X @ w + b)
---
A model can use more than one fact at a time. Each column gets its own dial, called a **weight**:

```text
guess = w1 * first_term + w2 * absences + b
```

Say it as "the first weight times the first-term grade, plus the second weight times the absences, plus `b`". Fitting a line with several inputs like this is **multivariate regression**: one weight per column, and one `b`.

`X @ w` does every student at once. `X` is the table, one row per student and one column per fact; `w` holds the weights. The matrix product `@`, from Act V, multiplies each row by the weights and adds up. So the example prints `[11.9 15. ]`, one guess per student.

The usual mistake is putting the weights in a different order from the columns. The first weight always goes with the first column.
