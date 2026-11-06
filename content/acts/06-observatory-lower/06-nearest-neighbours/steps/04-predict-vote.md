---
id: predict-vote
type: predict
title: One neighbour or three
concept: knn
code: |
  import numpy as np
  from collections import Counter

  X = np.array([[0.0, 0.0], [1.0, 0.0], [0.0, 1.2], [1.0, 1.0], [3.0, 3.0]])
  species = np.array(["Chinstrap", "Gentoo", "Gentoo", "Adelie", "Adelie"])
  new = np.array([0.1, 0.1])

  nearest = np.argsort(np.sqrt(((X - new) ** 2).sum(axis=1)))
  for k in [1, 3]:
      print(k, Counter(species[nearest[:k]]).most_common(1)[0][0])
question: What does this print?
options:
  - text: |-
      1 Chinstrap
      3 Gentoo
    correct: true
    feedback: "Right. The very nearest is the Chinstrap at (0, 0). The next two are Gentoos, so three neighbours outvote it."
  - text: |-
      1 Chinstrap
      3 Chinstrap
    misconception: knn-vote-is-nearest
    feedback: "With k = 3 the three nearest each get one vote: a Chinstrap and two Gentoos. The commonest label wins, not the nearest."
  - text: |-
      1 Adelie
      3 Adelie
    misconception: argsort-largest-first
    feedback: "`np.argsort` puts the smallest distance first, so `nearest[:1]` is the nearest penguin, at (0, 0). The Adelies are the furthest away."
---
Five named penguins, already scaled, and a new one near the corner at (0, 0). The same neighbours vote twice: once with k = 1, once with k = 3.
