---
id: no-map
type: learn
title: Racing without the map
concept: monte-carlo
dialogue:
  - paul.thinking.think: "Last week you had every chance written down. On League night, nobody hands the crab the list."
code: |
  import numpy as np


  def step(rng):
      """Told right on (0, 2): one real step. Where it landed, the reward, and whether the race is over."""
      if rng.random() < 0.8:
          return (0, 3), 10, True        # onto the finish
      if rng.random() < 0.5:
          return (0, 2), -1, False       # slipped up and bumped the edge
      return (1, 2), -1, False           # slipped down


  rng = np.random.default_rng(3)
  for attempt in range(4):
      print(step(rng))
---
In the Gridworld Solver, `outcomes` listed every place a step could lead, with its chance. That list is a **model** of the grid: a map.

The real crab has no map. It has `step`: try a move, and find out where it landed, what it earned, and whether the race is over. One sample at a time, never the list. Learning from samples alone is called **model-free**.

The example takes four real steps from the same tile and prints four samples: three onto the finish, one slip down. The chances are hidden inside `step`, as they are on the cabinet.

This project learns each tile's value from races alone, two ways. Last week's figures from the map are how you'll know they work.
