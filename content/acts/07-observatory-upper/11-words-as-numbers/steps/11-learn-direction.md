---
id: learn-direction
type: learn
title: Which rows point alike
concept: embeddings
code: |
  import numpy as np

  E = np.array([[2.0, 0.0],      # "4"
                [4.0, 0.5],      # "6"
                [0.0, 3.0]])     # "."

  unit = E / np.linalg.norm(E, axis=1, keepdims=True)    # every row, length 1
  print(unit.round(2))
  print((unit @ unit[0]).round(2))                       # how alike each is to "4"
---
Two embeddings are alike when they point the same way, whatever their lengths.

Divide every row by its own length, `np.linalg.norm(E, axis=1, keepdims=True)`, the length of an arrow from Act V. Now every row has length 1. The `@` of two such rows is 1 when they point the same way, 0 when they're at right angles, and -1 when they're opposite.

In the example `4` and `6` have very different lengths, but they point almost the same way: `0.99`. The full stop points somewhere else entirely: `0`.

To find a character's nearest neighbours, work out its `@` with every row and sort, biggest first, leaving out the character itself.

The usual mistake is comparing with distances, which count length as well as direction.
