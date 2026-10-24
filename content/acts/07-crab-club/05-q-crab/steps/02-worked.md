---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "The old grid, learned from scratch. No map, no outcomes. Just races."
code: |
  import numpy as np
  from saltmarsh import show_grid

  TRACK = ["...F", ".#.P", "S..."]
  MOVES = [(-1, 0), (1, 0), (0, -1), (0, 1)]       # actions 0 to 3: up, down, left, right
  SIDEWAYS = [(2, 3), (2, 3), (0, 1), (0, 1)]


  def step(tile, action, rng):
      """The grid as Sir Reginald meets it: one move, slipping sideways two times in ten."""
      if rng.random() < 0.2:
          action = SIDEWAYS[action][0 if rng.random() < 0.5 else 1]
      row, col = tile[0] + MOVES[action][0], tile[1] + MOVES[action][1]
      if not (0 <= row < 3 and 0 <= col < 4) or TRACK[row][col] == "#":
          row, col = tile
      mark = TRACK[row][col]
      return (row, col), {"F": 10, "P": -10}.get(mark, -1), mark in "FP"


  rng = np.random.default_rng(8)
  alpha, gamma, epsilon = 0.1, 0.9, 0.1
  Q = np.zeros((3, 4, 4))
  racing = [(row, col) for row in range(3) for col in range(4) if TRACK[row][col] in ".S"]

  for race in range(3000):
      tile = racing[rng.integers(len(racing))]
      over = False
      while not over:
          if rng.random() < epsilon:
              action = int(rng.integers(4))
          else:
              action = int(np.argmax(Q[tile]))
          after, reward, over = step(tile, action, rng)
          target = reward + (0 if over else gamma * Q[after].max())
          Q[tile][action] += alpha * (target - Q[tile][action])
          tile = after
      if race % 100 == 0:
          show_grid(Q.max(axis=2), policy=Q.argmax(axis=2), q=Q, walls=[(1, 1)], goal=(0, 3), title=f"race {race}")

  for row in range(3):
      print(" ".join("^v<>"[Q[row, col].argmax()] if TRACK[row][col] in ".S" else TRACK[row][col] for col in range(4)))
  print(f"Start: {Q[2, 0].max():.1f}. Value iteration said 1.2.")
subgoals:
  - label: The grid as he meets it, one step at a time
    lines: [9, 17]
  - label: "A Q-table of zeros: every tile, every action"
    lines: [20, 23]
  - label: Start a practice race anywhere
    lines: [25, 27]
  - label: Explore now and then, otherwise the best so far
    lines: [28, 32]
  - label: Take the step
    lines: [33, 33]
  - label: Nudge Q towards the reward plus the best of the next tile
    lines: [34, 35]
  - label: Move on
    lines: [36, 36]
  - label: Draw every hundredth race
    lines: [37, 38]
  - label: Read off the best move on each tile
    lines: [40, 42]
explain:
  prompt: "Line 34 uses `Q[after].max()`, the best move on the next tile, even though one time in ten he will explore and do something else. So what is Q-learning learning the worth of?"
  answer: "The best policy, not the one he's following. Each Q-value is what that move is worth if he plays his best from then on. He explores to gather races, but the exploring never gets into the target. That's called off-policy learning."
  concept: q-learning
---
Lines 28 to 32 are epsilon-greedy from the bait trials, one tile at a time. Line 34 is last week's TD target, with the next tile's best Q-value standing in for its value.

`Q[tile]` with a `(row, col)` tuple gives that tile's four action values. `Q.max(axis=2)` is each tile's best value; `Q.argmax(axis=2)` its best move.

Press Run and play the frames: arrows settle from the finish backwards. Point at a tile to see its four Q-values. It finds the same line value iteration found, without the map.
