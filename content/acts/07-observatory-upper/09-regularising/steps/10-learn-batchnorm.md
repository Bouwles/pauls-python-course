---
id: learn-batchnorm
type: learn
title: Every neuron on one scale
concept: batch-normalisation
code: |
  import numpy as np

  # A hidden layer's numbers for three evenings: one neuron in metres, one in knots
  Z = np.array([[3000.0, 12.0],
                [200.0, 30.0],
                [50.0, 2.0]])

  mean, var = Z.mean(axis=0), Z.var(axis=0)       # one per column: one per neuron
  normal = (Z - mean) / np.sqrt(var + 1e-5)
  print(normal.round(2))

  gamma, beta = np.array([1.0, 2.0]), np.array([0.0, 5.0])   # learnt, like weights
  print((gamma * normal + beta).round(2))
---
A hidden neuron's numbers can come out any size: thousands from readings in metres, tens from knots. **Batch normalisation** puts every neuron back on the same scale between layers, the way you standardised columns for the exam scores.

For each column of `Z`, one neuron, it takes away the batch's mean and divides by `np.sqrt(var + eps)`, its spread. `eps`, a tiny number, stops a division by 0. Then it multiplies each column by `gamma` and adds `beta`, two arrays the network learns, so it can undo the normalising wherever that helps.

The layer after it always sees numbers of about the same size, so training is steadier and can take bigger steps.

The usual mistake is normalising each row. Batch norm works down each column: one neuron, across every evening in the batch.
