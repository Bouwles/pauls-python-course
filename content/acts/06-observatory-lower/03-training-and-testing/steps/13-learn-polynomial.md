---
id: learn-polynomial
type: learn
title: Curves from extra columns
concept: polynomial-features
code: |
  import numpy as np

  hours = np.array([0.0, 0.5, 1.0, 2.0])
  table = np.column_stack([hours ** power for power in range(4)])
  print(table)
---
A straight line can't follow a curve, like a radiator cooling fast at first and then slowly. Linear regression can, if you give it extra columns: the input squared, the input cubed, and so on, each with a weight of its own. These are **polynomial features**, and the highest power is the **degree**.

The example builds the table for degree 3. Its columns are `hours ** 0`, which is all ones and stands in for `b`, then `hours`, `hours ** 2` and `hours ** 3`. It's still least squares, on a wider table.

The usual mistake is thinking a higher degree is always better. On the rows it learns from, a higher degree always fits at least as well, because it can bend more. That's exactly the trap, and it's next.
