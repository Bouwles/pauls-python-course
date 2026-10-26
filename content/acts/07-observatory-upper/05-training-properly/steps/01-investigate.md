---
id: investigate
type: investigate
title: The long gentle slope
concept: optimisers
dialogue:
  - wendt: "The north side of the hill. Gentle all the way down. The hiker takes forever."
code: |
  from workshop import show_hill


  def loss(x):
      return 0.01 * (x - 10) ** 2


  def slope(x):
      return 0.02 * (x - 10)


  rate = 1.0
  beta = 0.0          # how much of the last step to keep
  x, velocity = 0.0, 0.0
  for step in range(1, 501):
      velocity = beta * velocity + slope(x)
      x = x - rate * velocity
      show_hill(x, loss(x), curve=loss)
      if abs(x - 10) < 0.1:
          print(f"At the bottom after {step} steps")
          break
  else:
      print(f"Not there after 500 steps: x is {x:.3g}")
tasks:
  - id: plain
    prompt: "Run it and watch the hiker. With `beta = 0.0`, every step is the slope times the rate. How many steps does it take?"
    kind: answer
    accept: ["228", "228 steps"]
    feedback: "228. The slope shrinks as the hiker gets lower, so every stride is shorter than the last."
    wrong: "Read the number in the last line it prints."
  - id: momentum
    prompt: "Set `beta = 0.9` and run it again. Watch it run past the bottom, then come back. How many steps now?"
    kind: answer
    accept: ["37", "37 steps"]
    feedback: "37. The velocity keeps nine tenths of the last step, so on a slope that keeps pointing the same way, the strides build up. Past the bottom the slope turns round, and the velocity dies away."
    wrong: "Change beta on line 13, run it, and read the last line."
  - id: big-rate
    prompt: "Put `beta` back to `0.0` and set `rate = 120`. Does the hiker reach the bottom: yes or no?"
    kind: answer
    accept: ["no", "n", "it doesn't", "never"]
    feedback: "No. Each stride overshoots by more than the last, and it bounces off the hill. On this one hill, a rate of 50 would land in one step. In a brain, some weights have steep slopes and some gentle ones, and a rate big enough for the gentle ones throws the steep ones off. Momentum only speeds up where the slope keeps agreeing with itself."
    wrong: "Look at x in the last line: is it anywhere near 10?"
---
The **learning rate** sets the stride. Too small and the hiker crawls; too big and it overshoots, further each time.

**Momentum** adds a memory. The hiker keeps a `velocity`: most of the last step, plus the new slope. Then it steps by the velocity, not by the slope.

`show_hill` draws the hiker each time round the loop. Run it, and press Play under the output.
