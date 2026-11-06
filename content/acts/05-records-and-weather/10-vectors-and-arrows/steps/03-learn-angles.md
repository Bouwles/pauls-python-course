---
id: learn-angles
type: learn
title: From a bearing to an arrow and back
concept: vectors
code: |
  import numpy as np

  bearing = 90
  speed = 10.0
  angle = np.radians(bearing)
  arrow = np.array([speed * np.sin(angle), speed * np.cos(angle)])
  print(arrow.round(1))
  print(np.degrees(np.arctan2(arrow[0], arrow[1])) % 360)
---
A bearing is an angle measured clockwise from north. To turn a bearing and a speed into an arrow, split the speed into its east and north parts: east is the speed times the **sine** of the angle, north is the speed times the **cosine**. Picture an arrow one knot long at that angle: its east part is `sin`, its north part `cos`.

`np.sin` and `np.cos` want the angle in **radians**, not degrees: a whole turn is about 6.28 radians. `np.radians` converts.

Going back, `np.arctan2(east, north)` gives an arrow's angle in radians, `np.degrees` turns it into degrees, and `% 360` keeps it from 0 to 360. The example turns due east at 10 knots into `[10.  0.]`, and back into `90.0`.

The usual slip is to hand `np.sin` degrees. It reads 90 as ninety radians, and says nothing.
