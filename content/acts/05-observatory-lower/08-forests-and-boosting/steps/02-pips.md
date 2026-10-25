---
id: pips
type: pips
title: Pip's Version
files: [grove.py, tree.py, tools.py]
entry: grove.py
dialogue:
  - pip: "A forest. Fifty trees, each on its own bootstrap sample, two readings per question. Exactly as Penhallow said."
  - pip: "It's worse than one tree. And it's exactly as good as its own first tree. To four places."
dialogue_after:
  - pip: "Fifty generators, all started from the same seed, all drawing the same nights. One tree, fifty times."
  - pip: "Which is your copies, from the guessers. I was the guessers."
hints:
  nudge: "Print `rows[:5]` inside the loop. Does each tree get a different sample?"
  plan:
    - Make one generator, before the loop
    - Draw each tree's bootstrap sample from it
    - Grow each tree with it
  shape: |
    trees = []
    rng = ___
    for i in range(n_trees):
        rows = rng.integers(0, len(X), len(X))
        trees.append(fit_tree(X[rows], y[rows], max_depth=8, max_features=2, rng=rng))
---
A **random forest** grows many deep trees, each a little different, and averages them. Two things make them differ. Each tree learns from a **bootstrap sample**: as many nights as the log holds, drawn at random with replacement, so some nights come twice and some not at all. And each question may only consider a random two of the four readings. Every tree overfits, each in its own way, and the average cancels much of it.

`fit_tree` is Moss's, in `tree.py`, and is sound. Run Pip's forest, then find why his fifty trees are one tree. Fix `fit_forest`, keeping its `seed` so the forest can be grown again exactly.
