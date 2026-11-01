---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral.point: "The roof telescope's focus against the temperature. Plain descent takes two thousand steps. I counted. Here it is with momentum."
code: |
  import numpy as np

  readings = np.loadtxt("focus.csv", delimiter=",", skiprows=1)
  temperature, focus = readings[:, 1], readings[:, 2]

  for beta in (0.0, 0.9):
      w, b = 0.0, 0.0
      velocity = {"w": 0.0, "b": 0.0}
      for step in range(300):
          miss = w * temperature + b - focus
          slope = {"w": 2 * np.mean(miss * temperature), "b": 2 * np.mean(miss)}
          for name in velocity:
              velocity[name] = beta * velocity[name] + slope[name]
          w -= 0.003 * velocity["w"]
          b -= 0.003 * velocity["b"]
      loss = np.mean((w * temperature + b - focus) ** 2)
      print(f"beta {beta}: focus = {w:.4f} * temperature + {b:.3f}, loss {loss:.4f}")
subgoals:
  - label: The readings
    lines: [3, 4]
  - label: A velocity for every weight, starting at 0
    lines: [6, 8]
  - label: The slope, as downstairs
    lines: [9, 11]
  - label: Keep most of the last step, add the new slope
    lines: [12, 13]
  - label: Step by the velocity
    lines: [14, 15]
explain:
  prompt: "`b` needs to travel from 0 to about 42, but its slope shrinks as it gets close. Why does momentum help `b` so much more than it helps a bigger rate?"
  answer: "The slope for `w` is far steeper than the slope for `b`, because the temperatures multiply into it. A rate big enough to move `b` quickly throws `w` off the hill. Momentum doesn't change the rate: it lets `b`'s small, steady slope build up speed, because it points the same way step after step, while `w`'s zig-zags cancel out."
  concept: optimisers
---
Thirty nights of focus readings from the roof telescope, the sharp focus in millimetres against the temperature, and the same 300 steps twice: plain descent, then momentum. The best line, by formula, was `-0.1211 * temperature + 42.318`.

The velocity is kept in a dict with a key per weight, because each weight has its own slope and so its own speed.
