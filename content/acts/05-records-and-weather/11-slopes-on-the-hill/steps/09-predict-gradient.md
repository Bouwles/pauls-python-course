---
id: predict-gradient
type: predict
title: Uphill is west
concept: derivatives
code: |
  import math

  east_slope, north_slope = -0.2, 0.0
  print(round(math.degrees(math.atan2(east_slope, north_slope)) % 360), math.hypot(east_slope, north_slope))
question: What does this print?
options:
  - text: "270 0.2"
    correct: true
    feedback: "Right. The ground falls as you step east, so it rises to the west: a bearing of 270. The steepness is the arrow's length, which is never negative."
  - text: "90 0.2"
    misconception: gradient-sign-ignored
    feedback: "A negative east slope means the ground drops eastwards, so uphill is the other way: west, 270."
  - text: "270 -0.2"
    misconception: steepness-negative
    feedback: "The steepness is the gradient arrow's length, and a length is never negative. The minus sign went into the direction."
---
A point where the ground drops as you step east and is level north to south.
