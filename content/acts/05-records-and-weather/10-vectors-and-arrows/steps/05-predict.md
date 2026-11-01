---
id: predict-matmul
type: predict
title: The storm score
concept: matrices
dialogue:
  - aaesha.pleased: "My storm score. Wind once, rain twice, gusts three times. One score per evening."
  - yahya.proud: "Matrix times vector, or vector times matrix. Same numbers, so same answer."
code: |
  import numpy as np

  # Two evenings: wind, rain and gusts, each scored 0 to 3
  evenings = np.array([[2.0, 1.0, 0.0],
                       [0.0, 3.0, 1.0]])
  weights = np.array([1.0, 2.0, 3.0])

  print(evenings @ weights)
  print(weights @ evenings)
question: What happens?
verify: error
options:
  - text: "It prints [4. 9.], then stops with a ValueError"
    correct: true
    error: ValueError
    feedback: "Right. `evenings @ weights` is (2, 3) @ (3,): each evening's three readings meet the three weights, one score each. `weights @ evenings` is (3,) @ (2, 3), and 3 against 2 doesn't match."
  - text: "It prints [4. 9.] twice"
    misconception: matmul-commutes
    feedback: "Order matters with `@`. The left side gives the rows and the right side the columns, so swapping them asks for a different calculation: three weights against two evenings, which doesn't fit."
  - text: "It prints [[2. 2. 0.] [0. 6. 3.]], then stops with a ValueError"
    misconception: matmul-number-by-number
    error: ValueError
    feedback: "That's `evenings * weights`: every reading times its weight, left in place. `@` goes on to add each row up, so each evening gets one score: 2 + 2 + 0 is 4."
after: |
  Run it and read the last line of the error: it names the two sizes that don't match. Then change the last line to `print(evenings.T.shape)`.
---
`@` works between a matrix and a single arrow too. With one row per evening and one weight per column, `evenings @ weights` multiplies each row by the weights and adds it up: one weighted sum per evening.

The shapes still have to line up, inner against inner.
