---
id: learn-knn
type: learn
title: Ask the neighbours
concept: knn
code: |
  import numpy as np
  from collections import Counter

  # Five named penguins, already scaled, and a new one
  X = np.array([[1.2, 1.0], [1.0, 1.3], [-0.8, -1.0], [-1.1, -0.6], [0.9, 0.7]])
  species = np.array(["Gentoo", "Gentoo", "Adelie", "Adelie", "Chinstrap"])
  new = np.array([0.8, 0.9])

  distances = np.sqrt(((X - new) ** 2).sum(axis=1))
  nearest = np.argsort(distances)[:3]
  print(nearest)
  print(species[nearest])
  print(Counter(species[nearest]).most_common(1)[0][0])
---
**k nearest neighbours** names a new animal from the named ones most like it. It learns no weights. It keeps every named example, and when asked about a new one, it finds the `k` nearest and lets them vote. For a number, like cups of coffee, it takes their mean instead.

Picture naming a bird you've never seen by the ones you remember most like it. One memory might mislead you; three are a fairer sample.

`np.argsort(distances)` gives the positions of the rows in order of distance, nearest first. `[:3]` keeps three. `Counter(...).most_common(1)[0][0]` is the commonest label among them. The example's three nearest are a Chinstrap and two Gentoos, so it says `Gentoo`.

The usual mistake is thinking `argsort` gives the distances. It gives positions, which is what you need to look up the labels.
