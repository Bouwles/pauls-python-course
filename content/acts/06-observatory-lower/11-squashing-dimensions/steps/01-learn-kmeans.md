---
id: learn-kmeans
type: learn
title: Groups nobody named
concept: k-means
dialogue:
  - yahya.thinking.point: "No labels on these customers. No answers to learn from. Just what they spend."
code: |
  import numpy as np

  # Six customers' weekly spend, in pounds, and two centres to start from
  spend = np.array([10.0, 12.0, 14.0, 50.0, 55.0, 60.0])
  centres = np.array([10.0, 12.0])

  for step in range(3):
      labels = np.array([np.argmin(np.abs(centres - s)) for s in spend])   # join the nearest centre
      centres = np.array([spend[labels == j].mean() for j in range(2)])   # move to the middle
      print(labels, centres.round(1))
---
Every model so far learnt from answers. **k-means** has none. It sorts points into `k` groups, called **clusters**, from the points alone.

It keeps `k` centres, and repeats two steps:

1. Every point joins its nearest centre.
2. Every centre moves to the mean of its points.

It stops when no point changes group. Picture `k` people at a party, each walking to the middle of the crowd that's nearest them, until nobody moves.

The example starts with both centres among the small spenders. After one step, the second centre has drifted to 38.2, out in the gap; after two, the groups are the three small spenders and the three big ones, and nothing changes after that.

The usual mistake is thinking a centre is one of the points. It's a mean, and can sit where no point is.
