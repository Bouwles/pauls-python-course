---
id: learn-evaluation
type: learn
title: Sweep until nothing changes
concept: policy-evaluation
code: |
  # A corridor: the crab always goes right. Tile 3 is the finish.
  values = [0.0, 0.0, 0.0, 0.0]
  sweeps = 0
  while True:
      sweeps += 1
      biggest_change = 0
      for tile in range(3):
          if tile + 1 == 3:
              new = 10.0                            # onto the finish: nothing after
          else:
              new = -1 + 0.9 * values[tile + 1]
          biggest_change = max(biggest_change, abs(new - values[tile]))
          values[tile] = new
      if biggest_change < 1e-6:
          break
  print(sweeps, [round(value, 1) for value in values])
---
Every value depends on its neighbours' values, so where do you start? **Policy evaluation** starts every value at 0, then sweeps through the tiles, setting each from its neighbours with the policy's action. Then it sweeps again.

Each sweep carries news of the finish one tile further back. The values creep towards their true worth, and the changes get smaller.

Stop when the biggest change in a whole sweep is under **theta** (the Greek letter θ), a tiny number like `1e-6`, which is Python for 0.000001. On the racing grid the values may never stop changing exactly, so close enough is the goal.

The example prints `4 [6.2, 8.0, 10.0, 0.0]`: three sweeps to spread the news, one more to see nothing change.

The usual mistake is expecting one sweep to finish the job.
