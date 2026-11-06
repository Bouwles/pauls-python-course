---
id: learn-array
type: learn
title: A block of numbers
concept: numpy-arrays
dialogue:
  - yahya.pleased: "Everything up here is numbers. Thousands of them. We're not doing them one at a time."
code: |
  import numpy as np

  readings = np.array([14, 16, 12])
  print(readings)
  print(readings * 2)
  print(readings + 1)
---
**NumPy** is a library for working with a lot of numbers at once. Everyone imports it as `np`.

`np.array()` turns a list of numbers into an **array**: a block of numbers, all of the same type, stored side by side. Picture a strip of boxes, one number in each, all the same size.

Arithmetic on an array happens to every number in it at once. `readings * 2` doubles each reading, and `readings + 1` adds 1 to each, with no loop. The example prints `[14 16 12]`, `[28 32 24]`, then `[15 17 13]`. Arrays print without commas: that's how you tell one from a list.

The usual slip is to expect a list to do the same. A list times 2 is the list twice.
