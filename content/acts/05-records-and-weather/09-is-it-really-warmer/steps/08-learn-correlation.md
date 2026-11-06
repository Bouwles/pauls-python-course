---
id: learn-correlation
type: learn
title: Rising and falling together
concept: correlation-causation
code: |
  import numpy as np

  hours = np.array([1, 2, 3, 4, 5])
  print(round(np.corrcoef(hours, hours * 2 + 1)[0, 1], 2))
  print(round(np.corrcoef(hours, 10 - hours)[0, 1], 2))
  print(round(np.corrcoef(hours, [3, 1, 4, 1, 5])[0, 1], 2))
---
The **correlation**, r, says how closely two sets of numbers rise and fall together along a straight line: 1 if one goes up exactly as the other does, -1 if one goes down exactly as the other goes up, 0 for no straight-line pattern. Picture a scatter chart: the closer the dots hug a sloping line, the nearer r is to 1 or -1.

By hand: take each set's mean off its numbers, multiply the pairs and add them up, then divide by the square root of (the x's squared, added up, times the y's squared, added up). `np.corrcoef(x, y)[0, 1]` does it for you.

The example prints `1.0`, `-1.0`, then `0.35` for a loose scatter.

The usual slip is to read r as any link at all. It only measures a straight line.
