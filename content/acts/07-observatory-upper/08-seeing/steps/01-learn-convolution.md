---
id: learn-convolution
type: learn
title: A window slid across a picture
concept: convolutions
dialogue:
  - aaesha.thinking.point: "Cells in the visual cortex each watch one small patch. Not the whole picture. One patch."
code: |
  import numpy as np

  image = np.array([[1, 2, 3, 4],
                    [5, 6, 7, 8],
                    [9, 10, 11, 12]])
  kernel = np.array([[1, 0],
                     [0, 1]])                 # top-left plus bottom-right

  rows = image.shape[0] - kernel.shape[0] + 1
  cols = image.shape[1] - kernel.shape[1] + 1
  out = np.zeros((rows, cols), dtype=int)
  for i in range(rows):
      for j in range(cols):
          patch = image[i:i + 2, j:j + 2]     # the patch under the window
          out[i, j] = np.sum(patch * kernel)
  print(out)
---
The digit network read a picture as sixty-four numbers in a row. It had no idea which pixel was next to which.

A **convolution** looks at neighbours. It slides a small grid of weights, the **kernel**, across the picture. At each place the kernel fits entirely, it multiplies the kernel by the patch underneath and adds the lot up: a weighted sum, like a neuron's, with the same weights at every place. The answers make a smaller picture, a **feature map**.

A window can't hang off the edge, so the map loses the kernel's size less one each way. In the example a 2 by 2 kernel on a 3 by 4 picture fits 2 places down and 3 across.

The usual mistake is expecting the map to be the same size as the picture.
