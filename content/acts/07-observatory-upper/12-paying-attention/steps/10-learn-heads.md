---
id: learn-heads
type: learn
title: Several heads at once
concept: transformers
code: |
  import numpy as np

  head_one = np.array([[1.0, 2.0], [3.0, 4.0]])    # two characters, from one head
  head_two = np.array([[5.0, 6.0], [7.0, 8.0]])    # the same characters, from another

  joined = np.concatenate([head_one, head_two], axis=1)
  print(joined)
  print(joined.shape)
---
One attention, a **head**, can learn one kind of question. **Multi-head attention** runs several heads side by side, each with its own `Wq`, `Wk` and `Wv`, and each smaller than the whole. One might learn to look at the character just before; another at the last space.

Their answers are put side by side, not added: `np.concatenate(outputs, axis=1)` joins them along the columns, so each character's row holds every head's numbers. In the example two heads of 2 numbers make rows of 4.

Then one more matrix, `Wo`, mixes them back into a row the same size as each character's.

The usual mistake is averaging the heads. Each keeps its own columns, and `Wo` learns how to combine them.
