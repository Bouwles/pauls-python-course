---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul: "Which days blew rain straight at the front door? Compass arrows won't say. Door arrows will."
code: |
  import numpy as np

  # Three days at the front door: (east, north) in knots, pointing where the wind came from
  winds = np.array([[0.0, 10.0],
                    [8.0, -6.0],
                    [-5.0, 0.0]])

  # The street runs along bearing 060, and the front door faces south-east, at 150
  street = np.radians(60)
  door = np.radians(150)
  along = [np.sin(street), np.cos(street)]      # one knot along the street
  at_door = [np.sin(door), np.cos(door)]        # one knot straight at the door

  turn = np.array([along, at_door])             # one row per new direction: (2, 2)

  on_street = winds @ turn.T                    # (3, 2) @ (2, 2) gives (3, 2)
  print(on_street.round(1))

  print(round(np.dot(winds[1], along), 1), round(np.dot(winds[1], at_door), 1))
subgoals:
  - label: The arrows, one per row
    lines: [3, 6]
  - label: One-knot arrows for the new directions
    lines: [8, 12]
  - label: Stack them into a matrix
    lines: [14, 14]
  - label: Move every arrow with one @
    lines: [16, 17]
  - label: Check one row by hand
    lines: [19, 19]
explain:
  prompt: "Why does Paul write `winds @ turn.T`, and not `turn @ winds`?"
  answer: "`winds` has one arrow per row, shape (3, 2). `turn @ winds` would be (2, 2) @ (3, 2), and the inner sizes, 2 and 3, don't match. `winds @ turn.T` is (3, 2) @ (2, 2): each arrow, a row, meets each new direction, now a column, so row i of the answer is that day's dot product with `along` and with `at_door`."
  concept: matrices
---
A **matrix** is a two-dimensional array. `A @ B` multiplies two matrices: each row of `A` meets each column of `B` in a dot product, and entry `[i, j]` of the answer is row `i` dotted with column `j`. So the inner sizes must match and get used up:

```text
(n, k) @ (k, m)  gives  (n, m)
```

`turn.T` is the **transpose**: rows become columns.

Stack one-knot arrows as the rows of a matrix, and one `@` measures every wind against every new direction at once. The matrix has turned the arrows from compass directions into street directions. The second day blew straight at the door at 9.2 knots: that's the one that soaked the doormat.
