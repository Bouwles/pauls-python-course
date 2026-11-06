---
id: learn-cnn
type: learn
title: A network that sees
concept: convolutions
code: |
  import numpy as np


  def convolve(image, kernel):
      rows, cols = image.shape[0] - 2, image.shape[1] - 2      # a 3 by 3 kernel
      return np.array([[np.sum(image[i:i + 3, j:j + 3] * kernel) for j in range(cols)]
                       for i in range(rows)])


  def max_pool(feature):
      return np.array([[feature[i:i + 2, j:j + 2].max() for j in range(0, 6, 2)]
                       for i in range(0, 6, 2)])


  rng = np.random.default_rng(0)
  digit = rng.random((8, 8))
  kernels = rng.normal(0, 0.3, (4, 3, 3))      # four kernels, learnt like any other weights

  maps = np.array([np.maximum(0, convolve(digit, kernel)) for kernel in kernels])
  pooled = np.array([max_pool(feature) for feature in maps])
  row = pooled.reshape(-1)
  print(maps.shape, pooled.shape, row.shape)
---
A **convolutional network** puts the last three steps together. A layer of several kernels makes several feature maps, one each, stacked: four kernels on an 8 by 8 digit make maps of shape `(4, 6, 6)`. Each map gets its kernel's bias and a ReLU, then is pooled to `(4, 3, 3)`.

Then the maps are flattened, filter by filter, into one row of 36 numbers, and an ordinary layer and a softmax turn that row into ten chances, as in your digit reader.

Nobody writes the kernels by hand. They're weights, learnt by backpropagation like any others, and they tend to become edge-finders by themselves, because edges are useful.

The usual mistake is thinking each place gets its own kernel. One kernel slides everywhere, so it finds its pattern wherever it is.
