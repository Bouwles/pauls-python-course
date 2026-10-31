---
id: predict-eigh
type: predict
title: The directions that don't turn
concept: eigenvectors
dialogue:
  - paul: "A tailor's records. Chest and waist: when one is generous, so is the other. Not always, but usually."
  - riya: "Then the measurements spread out along a slant. That slant is what I'm after."
code: |
  import numpy as np

  # How a tailor's customers vary, in square centimetres: chest, then waist
  spread = np.array([[9.0, 6.0],
                     [6.0, 9.0]])
  values, vectors = np.linalg.eigh(spread)
  print(values)
question: What does this print?
options:
  - text: "[15.  3.]"
    misconception: eigh-biggest-first
    feedback: "`np.linalg.eigh` hands the eigenvalues back smallest first: 3, then 15. If you want the biggest first, and for PCA you do, reorder them yourself, and the eigenvectors with them."
  - text: "[ 3. 15.]"
    correct: true
    feedback: "Right, smallest first. The 15 belongs to the slant (0.71, 0.71): chest and waist growing together. The 3 belongs to (-0.71, 0.71): one up, the other down."
  - text: "[9. 9.]"
    misconception: eigenvalues-are-diagonal
    feedback: "The diagonal holds each measurement's own variance, 9 square centimetres. The eigenvalues are the variances along the special directions, and because chest and waist move together, one slant holds far more, 15, and the other far less, 3."
after: |
  Run it, then print `vectors`. Each **column** is a direction, not each row. Check that `spread @ vectors[:, 1]` comes out as `15 * vectors[:, 1]`.
---
A **covariance matrix** says how readings vary together: each reading's variance down the diagonal, and how much each pair moves together everywhere else.

Multiply a direction by a matrix and it usually turns. An **eigenvector** is a direction that doesn't: the matrix only stretches it, by its **eigenvalue**. For a covariance matrix, the eigenvectors are the directions the readings spread along, and each eigenvalue is the variance in that direction. `np.linalg.eigh` finds them.
