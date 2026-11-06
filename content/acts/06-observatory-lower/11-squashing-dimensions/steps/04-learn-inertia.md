---
id: learn-inertia
type: learn
title: Tight groups, and bad starts
concept: k-means
code: |
  import numpy as np

  spend = np.array([1.0, 2.0, 10.0, 11.0, 20.0, 21.0])


  def k_means(centres):
      for step in range(10):
          labels = np.array([np.argmin(np.abs(centres - s)) for s in spend])
          centres = np.array([spend[labels == j].mean() for j in range(len(centres))])
      inertia = np.sum((spend - centres[labels]) ** 2)
      return centres, inertia


  for start in [[1.0, 2.0, 10.0], [1.0, 10.0, 20.0]]:
      centres, inertia = k_means(np.array(start))
      print(centres, inertia)
---
The **inertia** says how tight the groups are: each point's distance to its own centre, squared, all added up. Lower is tighter. Both steps of k-means can only lower it or leave it alone, so the loop always stops.

But it can stop in the wrong place. k-means walks downhill from wherever its centres start, and settles in the first hollow it finds. The example runs it twice on the same six points with three centres. Started with two centres in the first pair, it ends with an inertia of `101.0`. Started one in each pair, it finds the three pairs, `1.5`.

So run it from several random starts and keep the run with the lowest inertia.

The usual mistake is trusting one run. The same points can give different groups from different starts.
