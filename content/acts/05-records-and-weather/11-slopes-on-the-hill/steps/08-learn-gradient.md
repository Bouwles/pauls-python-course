---
id: learn-gradient
type: learn
title: Straight uphill
concept: derivatives
code: |
  import math

  east_slope, north_slope = 0.3, 0.4
  print(round(math.degrees(math.atan2(east_slope, north_slope)) % 360))
  print(math.hypot(east_slope, north_slope))
---
Put the two partial slopes together as an arrow, `(east_slope, north_slope)`, and it points straight uphill: the steepest way up from where you stand. Its length is how steep that way is. This arrow is the **gradient**.

You know how to read an arrow from the linear algebra lab. `math.atan2(east, north)` gives its angle and `math.hypot(east, north)` its length: the same as `np.arctan2` and `np.linalg.norm`, for single numbers.

The example's slopes, 0.3 east and 0.4 north, point uphill on a bearing of `37` degrees, steepness `0.5`.

Machine learning walks the other way: to make an error smaller, step against the gradient, straight downhill. The usual slip is to expect uphill to point at the top. It only does on a perfectly round hill.
