---
id: learn-numerical
type: learn
title: A step either side
concept: numerical-gradients
code: |
  def f(x):
      return x ** 2


  step = 0.001
  one_way = (f(3 + step) - f(3)) / step
  either_side = (f(3 + step) - f(3 - step)) / (2 * step)
  print(round(one_way, 6), round(either_side, 6))
---
Measuring a slope instead of working it out is a **numerical gradient**. The best simple way is a small step either side: work out `f(x + step)` and `f(x - step)`, and divide the difference by the distance between the two points, `2 * step`.

Stepping both ways is far more accurate than stepping one way. The curve bends the same amount on each side, and the two bends cancel.

The slope of `x ** 2` at 3 is exactly 6. The example measures it both ways: one way gives `6.001`, either side `6.0`.

The usual slip is dividing by `step` instead of `2 * step`. The two points are two steps apart, so the slope comes out twice as big.
