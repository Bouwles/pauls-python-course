---
id: learn-replay-moves
type: learn
title: More lessons from every move
concept: dqn
code: |
  import numpy as np

  rng = np.random.default_rng(4)
  memory = [f"move {n}" for n in range(30)]    # thirty practice moves so far
  replay = 10

  picks = [len(memory) - 1] + list(rng.integers(len(memory), size=replay))
  print(len(picks), "lessons:", [memory[i] for i in picks[:4]], "...")
  print("5000 practice moves teach it", 5000 * (1 + replay), "times")
---
A practice move costs budget. Learning from a move it remembers costs nothing. So keep Deep Q's replay idea, with the Q-table: remember every move as `(tile, action, reward, after, over)`, and after each real move, do the Q-learning update for that move and for ten more picked at random from memory.

`rng.integers(30, size=10)` picks ten positions from 0 to 29. The same one can come up twice, which does no harm. The example prints `11 lessons`, the newest move first, and works out that 5000 moves now teach it 55,000 times.

Learning that much from so few moves can overshoot, so let epsilon and the step size shrink race by race, as Deep Q's epsilon did. Then the values settle.

The usual mistake is learning once from each move, and running out of budget before the crab knows the course.
