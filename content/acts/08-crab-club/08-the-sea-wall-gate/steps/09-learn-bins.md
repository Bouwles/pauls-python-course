---
id: learn-bins
type: learn
title: Readings into bins
concept: gymnasium
code: |
  import numpy as np

  LEVELS = [2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75]   # the edges between bins

  for level in [2.1, 2.6, 3.0, 3.9]:
      print(level, int(np.digitize(level, LEVELS)))
---
The racing grid had twelve tiles, so a Q-table had twelve rows. The tide gate's observation is four measurements, like a harbour level of 2.63 metres, and there's no end of those. A table can't have a row for every one.

So cut each measurement into a few **bins**, ranges like "between 2.5 and 2.75 metres", and number them. `np.digitize(level, LEVELS)` gives the number of the bin a reading falls in, counting the edges below it. A tuple of the four bin numbers then picks a row of the Q-table.

The example prints `2.1 0`, `2.6 2`, `3.0 4` and `3.9 7`: eight bins from seven edges. A reading exactly on an edge goes in the bin above it.

The usual mistake is too many bins. Each one is visited less often, so it learns more slowly.
