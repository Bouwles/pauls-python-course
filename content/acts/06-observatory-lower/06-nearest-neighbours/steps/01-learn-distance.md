---
id: learn-distance
type: learn
title: How alike is alike?
concept: knn
dialogue:
  - aaesha.thinking.point: "Two penguins are alike if their measurements are close. So, how close?"
code: |
  import numpy as np

  # Flipper length (cm) and bill depth (cm) of three penguins, and a new one
  penguins = np.array([[21.5, 1.5],
                       [19.0, 1.8],
                       [22.0, 1.5]])
  new = np.array([21.2, 1.5])

  differences = penguins - new
  print(np.sqrt((differences ** 2).sum(axis=1)).round(2))
  print(np.abs(differences).sum(axis=1).round(2))
---
Two animals are alike when their measurements are close. The **distance** between them puts a number on it: take the differences, square them, add them up, and take the square root. It's Pythagoras, the length of an arrow from Act V, with one measurement per direction.

`penguins - new` subtracts the new penguin from every row at once, by broadcasting. `.sum(axis=1)` adds along each row, so you get one distance per penguin: the first line prints `[0.3  2.22 0.8 ]`.

**Manhattan distance** adds up the plain differences instead, without squaring, like walking a grid of streets instead of flying straight. `np.abs` drops the minus signs. That's the second line.

The usual mistake is measuring before scaling. A measurement counted in thousands, like grams, swamps one counted in tenths.
