---
id: predict-pool
type: predict
title: The biggest in each block
concept: convolutions
dialogue:
  - neil.neutral: "Then it shrinks each map. Keeps the strongest answer in every two by two block, and drops the rest."
code: |
  import numpy as np

  feature = np.array([[1, 3, 0, 2, 5],
                      [4, 2, 1, 0, 1],
                      [0, 0, 6, 1, 2],
                      [2, 1, 3, 3, 9]])

  rows, cols = feature.shape[0] // 2, feature.shape[1] // 2
  pooled = np.zeros((rows, cols), dtype=int)
  for i in range(rows):
      for j in range(cols):
          pooled[i, j] = feature[2 * i:2 * i + 2, 2 * j:2 * j + 2].max()
  print(pooled)
question: What does this print?
options:
  - text: |-
      [[4 2]
       [2 6]]
    correct: true
    feedback: "Right. Four blocks of two by two, the biggest of each. The fifth column doesn't make a whole block, so it's dropped, 9 and all. A feature map says where something was found; pooling keeps whether it was found nearby and throws away exactly where."
  - text: |-
      [[4 2 5]
       [2 6 9]]
    misconception: pool-keeps-leftovers
    feedback: "`5 // 2` is 2, so there are only two blocks across. The last column doesn't fill a block, and this pooling drops it."
  - text: |-
      [[2 0]
       [0 3]]
    misconception: pool-averages
    feedback: "That's each block's average, rounded down. Max pooling keeps the biggest number in each block: the strongest sign that the kernel found its edge there."
after: |
  Run it. Then change one number in the top-left block that isn't the 4, and run it again.
---
**Max pooling** shrinks a feature map by keeping the biggest number in each block. A 6 by 6 map becomes 3 by 3: a quarter of the numbers, and a digit drawn a pixel to the left gives nearly the same answer.
