---
id: learn-dot
type: learn
title: How much lies along
concept: vectors
code: |
  import numpy as np

  wind = np.array([3.0, 4.0])
  north = np.array([0.0, 1.0])
  east = np.array([1.0, 0.0])
  print(np.dot(wind, north), np.dot(wind, east))
---
The **dot product** of two arrows multiplies them part by part and adds the results: `np.dot([a, b], [c, d])` is `a * c + b * d`, one number.

When one arrow is exactly one knot long, the dot product is how much of the other lies along it. Picture the sun straight overhead: it's the length of the wind arrow's shadow on the one-knot arrow's line. With `ahead`, one knot in the direction a plane points, `np.dot(wind, ahead)` is the headwind.

It's positive when the arrows point roughly the same way, 0 at right angles, negative when they point apart. In general it's both lengths multiplied, times the cosine of the angle between, so `np.arccos` can find that angle.

The example prints `4.0 3.0`. The usual slip is to expect an arrow back. It's one number.
