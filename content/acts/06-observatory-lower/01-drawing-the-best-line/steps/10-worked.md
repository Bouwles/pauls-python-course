---
id: worked
type: worked
title: How Paul would walk it
dialogue:
  - paul.neutral.point: "The wall clock in here. I set it a little slow, and it loses more every day."
  - paul.unimpressed: "The big clock's still stuck at 3:14. This one at least moves."
code: |
  import numpy as np

  # Paul's wall clock: days since he set it, and how many seconds slow it was
  days = np.array([1.0, 2.0, 4.0, 5.0, 7.0])
  seconds_slow = np.array([7.1, 10.9, 19.2, 22.8, 31.1])


  def loss(drift, offset):
      return np.mean((drift * days + offset - seconds_slow) ** 2)


  def slopes(drift, offset):
      miss = drift * days + offset - seconds_slow
      return 2 * np.mean(miss * days), 2 * np.mean(miss)


  rate = 0.02
  drift, offset = 0.0, 0.0
  losses = []
  for step in range(3000):
      losses.append(loss(drift, offset))
      d_drift, d_offset = slopes(drift, offset)
      drift = drift - rate * d_drift
      offset = offset - rate * d_offset

  print(f"Loss: {losses[0]:.1f} at the start, {losses[-1]:.3f} at the end")
  print(f"It loses {drift:.2f} seconds a day, and started {offset:.1f} seconds slow.")
subgoals:
  - label: The readings
    lines: [3, 5]
  - label: Measure the miss
    lines: [8, 9]
  - label: Find the slope of the loss
    lines: [12, 14]
  - label: Start from a guess
    lines: [17, 19]
  - label: Take many steps
    lines: [20, 20]
  - label: Keep the loss
    lines: [21, 21]
  - label: Step downhill
    lines: [22, 24]
  - label: Show what it found
    lines: [26, 27]
explain:
  prompt: "Why does line 23 take `rate * d_drift` away instead of adding it?"
  answer: "The slope points uphill. Where the loss rises as `drift` grows, the slope is positive and `drift` should shrink; where it falls, the slope is negative and taking it away makes `drift` bigger. Either way, taking it away walks downhill. Adding would walk uphill, and the loss would grow with every step."
  concept: gradient-descent
---
The same walk as the last example, on Paul's wall clock: two dials, `drift`, the seconds it loses a day, and `offset`, how slow it started. `loss` and `slopes` are the mean squared error and its two slopes, with the readings' own names.

Nothing in the loop knows the answer. It only knows which way is down. `losses` keeps the loss from before each step, so you can see that it fell.

Your Build does the same, with `w` and `b`, as two functions. The labels beside the code are its steps. Run it, then change `rate` to 0.06 and run it again.
