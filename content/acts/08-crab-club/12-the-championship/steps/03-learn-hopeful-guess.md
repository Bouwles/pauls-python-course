---
id: learn-hopeful-guess
type: learn
title: A hopeful first guess
concept: q-learning
code: |
  FINISH = (3, 8)
  STEPS = [(-1, 0), (1, 0), (0, -1), (0, 1)]   # up, down, left, right

  tile = (3, 6)
  for name, (d_row, d_col) in zip(["up", "down", "left", "right"], STEPS):
      after = (tile[0] + d_row, tile[1] + d_col)
      gull = abs(after[0] - FINISH[0]) + abs(after[1] - FINISH[1])   # moves left as the gull flies
      print(name, -1 - gull)
---
The Q-Learning Crab started every Q-value at 0 and had thousands of races to sort them out. Here it has 5000 practice moves on a course it has never seen, so where it starts matters.

A good start is the **gull's distance**: how many moves to the finish if nothing were in the way, the rows apart plus the columns apart. Start each move's Q-value at -1 for the move itself, minus the gull's distance from where it lands. The example prints -4 for up, down and left, and `-2` for right, towards the finish.

Rocks and pools only ever make the real way longer, so this guess is **hopeful**: no move is worse than its guess says. A move loses its shine only once it's been tried and found slower, so the crab heads the right way first, and still goes and looks.
