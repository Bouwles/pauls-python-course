---
id: learn-scale
type: learn
title: From one size to a bigger one
concept: big-o
code: |
  import math

  print(2000 / 1000)
  print((2000 / 1000) ** 2)
  print(math.log2(1024), math.log2(2048))
  print(round(math.log(2048) / math.log(1024), 2))
---
Know the growth, and you can say how many times more work a bigger pile takes:

- **O(n)**: divide the sizes. `2000 / 1000` is 2, so twice the work.
- **O(n²)**: divide, then square. Four times.
- **O(log n)**: divide the logs. `math.log2(n)` is how many times n halves before it reaches 1: 1,024 halves 10 times. `math.log` counts on another scale, but one log divided by another comes out the same.
- **O(n log n)**: n times its log, divided the same way.

The example prints `2.0`, `4.0`, `10.0 11.0`, then `1.1`.

Turn it round to guess a growth: count the steps at n and at twice n, divide, and see whose number is nearest. The usual slip is to scale everything as if it doubles.
