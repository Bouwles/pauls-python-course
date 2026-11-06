---
id: learn-pool
type: learn
title: Keeping the strongest
concept: convolutions
code: |
  import numpy as np

  feature = np.array([[1, 0, 2, 3],
                      [0, 5, 1, 1],
                      [7, 1, 0, 0],
                      [2, 2, 0, 4]])

  pooled = np.zeros((2, 2), dtype=int)
  for i in range(2):
      for j in range(2):
          pooled[i, j] = feature[2 * i:2 * i + 2, 2 * j:2 * j + 2].max()
  print(pooled)
---
A feature map says where the kernel found its pattern. Often it matters only that it was found somewhere near, not on exactly which pixel: a digit drawn one pixel to the left is the same digit.

**Max pooling** shrinks a map by cutting it into blocks, 2 by 2 here, and keeping only the biggest number in each: the strongest sign that the pattern was there. A 4 by 4 map becomes 2 by 2, a quarter of the numbers. In the example the top-left block's biggest is `5`.

`feature[2 * i:2 * i + 2, 2 * j:2 * j + 2]` is the block in row `i` and column `j` of blocks. Rows or columns left over that don't make a whole block are dropped.

The usual mistake is averaging each block. Max pooling keeps the biggest.
