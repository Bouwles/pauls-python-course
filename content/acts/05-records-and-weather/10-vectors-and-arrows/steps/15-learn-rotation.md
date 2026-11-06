---
id: learn-rotation
type: learn
title: A matrix that turns
concept: matrices
code: |
  import numpy as np

  angle = np.radians(90)
  rotation = np.array([[np.cos(angle), -np.sin(angle)],
                       [np.sin(angle), np.cos(angle)]])
  print((rotation @ np.array([10.0, 0.0])).round(1))

  points = np.array([[10.0, 0.0],
                     [0.0, 5.0]])
  print((points @ rotation.T).round(1))
---
A matrix can turn points about `(0, 0)`. Turning anticlockwise by an angle is the matrix `[[cos, -sin], [sin, cos]]` of that angle, in radians.

Picture where the two one-unit arrows end up. East, `(1, 0)`, turns to `(cos, sin)`, and north, `(0, 1)`, turns to `(-sin, cos)`. Those are the matrix's two columns, and every other point goes along with them.

`rotation @ point` turns one point. With one point per row, `points @ rotation.T` turns them all at once. The example turns `(10, 0)` a quarter turn, to `[ 0. 10.]`, then turns two points together.

The usual slip is the minus sign. Put it on the wrong `sin` and the turn goes clockwise.
