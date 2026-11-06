---
id: learn-forest
type: learn
title: A forest of different trees
concept: ensembles
code: |
  import numpy as np

  rng = np.random.default_rng(3)
  rows = rng.integers(0, 8, 8)          # 8 rows drawn from 8, each put back after
  print(rows)
  print(sorted(set(rows.tolist())))
  columns = rng.choice(7, 3, replace=False)
  print(columns)
---
A **random forest** is an ensemble of trees, made to differ in two ways.

First, each tree learns from its own **bootstrap sample**: as many rows as the data has, drawn at random and put back after each draw, so some rows come up twice and some not at all. `rng.integers(0, 8, 8)` draws eight row numbers from 0 to 7. The example's sample uses only rows `[0, 1, 4, 6]`.

Second, each question looks at a few columns chosen at random: `rng.choice(7, 3, replace=False)` picks 3 of 7, with no repeats.

Then the trees vote. The forest gives the share of trees that say yes, and approves when it's at least a half.

The usual mistake is thinking a bootstrap sample is the data shuffled. It repeats rows.
