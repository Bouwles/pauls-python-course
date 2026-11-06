---
id: learn-chain
type: learn
title: Rates multiply
concept: chain-rule
code: |
  def f(x):
      return (3 * x + 1) ** 2


  x = 2.0
  inner = 3 * x + 1
  worked_out = 2 * inner * 3

  step = 1e-5
  measured = (f(x + step) - f(x - step)) / (2 * step)
  print(worked_out, round(measured, 3))
---
When one thing depends on a second, and the second on a third, their rates multiply. That's the **chain rule**. Picture three gears: if the first turns the second three times as fast, and the second turns the third twice as fast, the third turns six times as fast as the first.

Take `(3 * x + 1) ** 2`. The inner part, `3 * x + 1`, changes 3 for each 1 that `x` changes. The outer part, squaring, has slope `2 * inner`, taken at whatever the inner value is. So the whole slope is `2 * inner * 3`.

At `x = 2` the inner value is 7, so it's `42`. The example works that out, then measures it a step either side: `42.0 42.0`.

The usual slip is to take the outer slope at `x` instead of at the inner value.
