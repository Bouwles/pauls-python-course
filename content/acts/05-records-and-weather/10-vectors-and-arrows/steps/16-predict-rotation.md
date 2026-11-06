---
id: predict-rotation
type: predict
title: Half a turn
concept: matrices
code: |
  import numpy as np

  angle = np.radians(180)
  rotation = np.array([[np.cos(angle), -np.sin(angle)],
                       [np.sin(angle), np.cos(angle)]])
  print((rotation @ np.array([3.0, 4.0])).round(1))
question: What does this print?
options:
  - text: "[-3. -4.]"
    correct: true
    feedback: "Right. Half a turn about `(0, 0)` points everything the opposite way: both parts change sign."
  - text: "[ 3. -4.]"
    misconception: rotation-flips-one-axis
    feedback: "That's a mirror, top to bottom. A half turn moves both parts: the point ends up on the far side of `(0, 0)`, at `(-3, -4)`."
---
The point `(3, 4)`, turned 180 degrees.
