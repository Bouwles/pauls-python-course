---
id: learn-split
type: learn
title: Lock some away
concept: train-test-split
dialogue:
  - paul.unimpressed: "A model marked on the answers it learnt from will always look clever."
code: |
  import numpy as np

  rng = np.random.default_rng(1)
  order = rng.permutation(10)        # the row numbers 0 to 9, shuffled
  print(order)

  test, train = order[:2], order[2:]
  print(test, train)
---
A model that has seen the answers can't be marked on them. To find out how it does on students it has never met, lock some away before it learns, and score it on those at the end.

The locked-away rows are the **test set**. The rest, the ones it learns from, are the **training set**.

Shuffle the row numbers first, with `rng.permutation`. Files often come in an order: `students.csv` lists one school, then the other. Then slice: the first few shuffled row numbers are for testing, the rest for training. The example locks away 2 rows of 10.

The usual mistake is looking at the test set while you're still building. Once its score has changed a single choice, it isn't new to the model any more.
