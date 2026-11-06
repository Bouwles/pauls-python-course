---
id: learn-biggest
type: learn
title: The best so far
code: |
  laps = [62.4, 59.8, 61.0, 59.8]
  best = laps[0]
  for lap in laps:
      if lap < best:
          best = lap
  print("Best lap:", best)
---
To find the biggest or smallest item in a list, start with the first one as the best so far. Then go through the list and swap in any item that beats it.

Yahya wants the biggest expense. Neil wants his fastest lap. It's the same loop.

Here the fastest lap is the smallest time. `best` starts at 62.4. Then 59.8 beats it, so `best` becomes 59.8. 61.0 doesn't beat that, and the second 59.8 only ties, so the first one stays. The example prints `Best lap: 59.8`.

The usual slip is starting `best` at 0. Nothing is faster than 0, so it never changes. Start from the first item, after checking the list isn't empty: an empty list has no `[0]`.
