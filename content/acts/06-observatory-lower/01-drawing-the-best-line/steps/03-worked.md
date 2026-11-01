---
id: worked
type: worked
title: How Paul would walk it
dialogue:
  - paul.neutral.point: "The wall clock in here. I've timed it all week. It loses a bit every day."
  - paul.unimpressed: "The big clock's still stuck at 3:14. This one at least moves."
  - neil.thinking: "One number to find: seconds lost a day. One setting, so one hill."
code: |
  import numpy as np
  from workshop import show_hill

  days = np.array([1.0, 2.0, 4.0, 5.0, 7.0])
  seconds_slow = np.array([4.1, 7.9, 16.2, 19.8, 28.1])


  def loss_at(drift):
      return np.mean((drift * days - seconds_slow) ** 2)


  rate = 0.01
  drift = 0.0
  for step in range(50):
      miss = drift * days - seconds_slow
      slope = 2 * np.mean(miss * days)
      drift = drift - rate * slope
      show_hill(drift, loss_at(drift), curve=loss_at)
      if step % 10 == 0:
          print(f"step {step}: drift {drift:.3f}, loss {loss_at(drift):.3f}")

  print(f"The clock loses {drift:.2f} seconds a day.")
subgoals:
  - label: The readings
    lines: [4, 5]
  - label: Measure the miss
    lines: [8, 9]
  - label: Start from a guess
    lines: [12, 13]
  - label: Take many steps
    lines: [14, 14]
  - label: Find the slope of the loss
    lines: [15, 16]
  - label: Step downhill
    lines: [17, 17]
  - label: Watch it walk
    lines: [18, 22]
explain:
  prompt: "Why does line 17 subtract `rate * slope` instead of adding it?"
  answer: "The slope points uphill. Where the loss rises as `drift` grows, the slope is positive and `drift` should shrink; where it falls, the slope is negative and subtracting it makes `drift` bigger. Either way, subtracting walks downhill. Adding would walk uphill, and the loss would grow with every step."
  concept: gradient-descent
---
The loss is the mean squared error, worked out for any `drift`. Its slope comes from the chain rule:

```text
slope = 2 * mean((drift * days - seconds_slow) * days)
```

Each pass finds the slope where it stands and steps downhill. Nothing in the loop knows the answer is about 4. It only ever knows which way is down.

`show_hill`, from the `workshop` module, draws a hiker on the hill: call it once a step with where it is and the loss there, and pass the loss function as `curve` so it can draw the hill. It prints nothing. Run it and watch the walk. Then change `rate` to 0.06 and run it again.
