---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "The practice pen behind the clubhouse. Six tiles, no rock, no pool."
  - moss: "And no slipping. The committee had it levelled."
code: |
  from saltmarsh import show_grid

  FINISH = (0, 2)
  POLICY = {(0, 0): "right", (0, 1): "right", (1, 0): "right", (1, 1): "right", (1, 2): "up"}
  STEPS = {"up": (-1, 0), "right": (0, 1)}
  GAMMA = 0.9

  values = {(row, col): 0.0 for row in range(2) for col in range(3)}
  sweep = 0
  while True:
      sweep += 1
      biggest_change = 0
      for tile, action in POLICY.items():
          after = (tile[0] + STEPS[action][0], tile[1] + STEPS[action][1])
          if after == FINISH:
              new = 10
          else:
              new = -1 + GAMMA * values[after]
          biggest_change = max(biggest_change, abs(new - values[tile]))
          values[tile] = new
      grid = [[values[(row, col)] for col in range(3)] for row in range(2)]
      arrows = [[POLICY.get((row, col)) for col in range(3)] for row in range(2)]
      show_grid(grid, policy=arrows, goal=FINISH, title=f"sweep {sweep}")
      if biggest_change < 1e-6:
          break

  print(sweep, "sweeps")
  for row in range(2):
      print("  ".join(f"{values[(row, col)]:5.1f}" for col in range(3)))
subgoals:
  - label: The pen, the policy and gamma
    lines: [3, 6]
  - label: Start every value at nothing
    lines: [8, 8]
  - label: "Sweep: follow each tile's policy one step"
    lines: [13, 14]
  - label: The finish has nothing after it
    lines: [15, 16]
  - label: Otherwise, the step's reward plus gamma times the worth of where it leads
    lines: [17, 18]
  - label: Keep track of the biggest change
    lines: [19, 20]
  - label: Draw the sweep
    lines: [21, 23]
  - label: Stop when nothing changes by more than a whisker
    lines: [24, 25]
explain:
  prompt: "Why does the loop stop when the biggest change is under `1e-6`, and not when it is exactly 0?"
  answer: "Here, with no slipping, the values happen to settle exactly, in four sweeps. On the racing grid, where he slips, they creep towards their true worth by smaller and smaller amounts for ever, and might never stop changing exactly. A threshold says close enough."
  concept: policy-evaluation
---
`show_grid`, from the `saltmarsh` module, draws the grid in the output panel: one frame each time it's called, tiles tinted by their values, the policy as arrows. Press Run and play the frames to watch the finish's worth spread back through the pen, a tile a sweep.

The values change in place, so a tile updated later in a sweep already sees this sweep's new values. Either way, they end up in the same place.
