---
id: predict-elbow
type: predict
title: How many groups
concept: k-means
dialogue:
  - pip: "Easy. Try every k and keep the one with the lowest inertia. Tightest groups win."
code: |
  import numpy as np
  from sklearn.cluster import KMeans

  rng = np.random.default_rng(1)
  clumps = np.array([[20.0, 20.0], [70.0, 30.0], [45.0, 80.0]])
  stars = np.vstack([middle + rng.normal(0, 4, size=(30, 2)) for middle in clumps])

  inertias = {}
  for k in range(1, 9):
      inertias[k] = KMeans(n_clusters=k, n_init=10, random_state=0).fit(stars).inertia_

  print(min(inertias, key=inertias.get))
question: "Ninety stars in three clumps. Which k has the lowest inertia?"
options:
  - text: "3"
    misconception: lowest-inertia-finds-k
    feedback: "Three is the right number of groups, but not the lowest inertia. Every extra centre can only bring some stars closer, so the inertia keeps falling all the way to 8. With 90 centres it would be 0."
  - text: "8"
    correct: true
    feedback: "Right. More centres always means tighter groups, so the lowest inertia is always the biggest k you try. Inertia can't choose k on its own."
  - text: "1"
    misconception: inertia-rises-with-k
    feedback: "More centres means more distances to measure, but each one is shorter. Every star is at least as close to its nearest of k + 1 centres as to its nearest of k."
after: |
  Run it, then print the whole of `inertias`, rounded. It drops from about 101,000 to 2,200 by k = 3, then crawls. That bend is the **elbow**: the last k where one more group was worth having.
---
scikit-learn has k-means too: `KMeans(n_clusters=k, n_init=10)` runs it from ten starts and keeps the best, and `inertia_` is that best inertia.

Here it is on ninety stars, for every k from 1 to 8.
