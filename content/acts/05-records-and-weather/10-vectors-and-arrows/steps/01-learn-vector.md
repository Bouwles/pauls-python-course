---
id: learn-vector
type: learn
title: Arrows, not bearings
concept: vectors
dialogue:
  - riya.pleased: "An arrow a day for the print. Long for a gale, short for a breeze."
code: |
  import numpy as np

  monday = np.array([6.0, 8.0])      # knots east, knots north
  print(monday + np.array([0.0, 4.0]))
  print(2 * monday)
  print(np.linalg.norm(monday))
---
A **vector** is a few numbers that belong together, in a fixed order. Riya draws each day's wind as an arrow: knots east, then knots north. In NumPy it's an array, `np.array([6.0, 8.0])`.

Arrows add part by part, east to east and north to north, which is the same as putting one arrow on the end of the other. Multiply an arrow by a number and it gets longer or shorter, still pointing the same way.

An arrow's length is Pythagoras: the square root of east squared plus north squared. `np.linalg.norm(arrow)` works it out.

The example prints `[ 6. 12.]`, `[12. 16.]`, then `10.0`.

The usual slip is to add the lengths. Two ten-knot winds from different directions don't make twenty.
