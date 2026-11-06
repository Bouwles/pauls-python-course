---
id: learn-edges
type: learn
title: A kernel that finds edges
concept: convolutions
code: |
  import numpy as np

  row = np.array([3, 3, 3, 7, 7, 7])          # dark, then light
  kernel = np.array([-1, 1])                  # right minus left: adds up to 0

  print(kernel.sum())
  print([int(np.sum(row[i:i + 2] * kernel)) for i in range(len(row) - 1)])
---
A kernel is a small picture of what it's looking for. Wherever the patch underneath looks like it, the sum is big; wherever it looks the opposite way, the sum is big and negative.

`[-1, 1]` is "lighter on the right than on the left". Its weights add up to 0, so on a patch that's all one shade the plus and the minus cancel: it only answers to change. In the example a row goes from dark, 3, to light, 7, and the kernel says `0` everywhere except at the step, where it says `4`.

That's an **edge**, and finding edges is where seeing starts. Turn a kernel on its side and it looks for edges the other way.

The usual mistake is thinking an edge kernel answers to brightness. On plain light it says 0, just as on plain dark.
