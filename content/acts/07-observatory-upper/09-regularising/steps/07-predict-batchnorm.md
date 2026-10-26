---
id: predict-batchnorm
type: predict
title: An average evening
concept: batch-normalisation
dialogue:
  - pip: "Batch norm on tonight's readings. Just the one evening. Should be quick."
code: |
  import numpy as np


  def standardise(Z, eps=1e-5):
      mean = Z.mean(axis=0)
      var = Z.var(axis=0)
      return (Z - mean) / np.sqrt(var + eps)


  tonight = np.array([[3.9, -1.2, 0.7]])     # one evening, three hidden neurons
  print(standardise(tonight))
question: What does this print?
options:
  - text: "[[0. 0. 0.]]"
    correct: true
    feedback: "Right. A batch of one is its own average, so every number minus its mean is 0. Batch statistics need a batch. At evaluation, batch norm uses averages it kept during training instead."
  - text: "[[ 3.9 -1.2  0.7]]"
    misconception: batchnorm-single-row-keeps-values
    feedback: "Each column's mean is taken over the batch, and this batch is one evening. Every number minus its own mean is 0."
  - text: "[[nan nan nan]]"
    misconception: batchnorm-divides-by-zero
    feedback: "The variance is 0, but `eps` is added before the square root, so 0 is divided by a small number and stays 0. That's what eps is for."
  - text: "[[ 1.31 -1.11 -0.21]]"
    misconception: batchnorm-normalises-rows
    feedback: "That normalises across the evening's three neurons. Batch norm works down each column: one neuron, across every evening in the batch."
after: |
  Run it. Then add a second evening, `[[3.9, -1.2, 0.7], [1.0, 0.8, 0.7]]`, and run it again. Look at the last column.
---
A hidden neuron's numbers can come out any size: thousands if the readings were in metres, hundredths if they were in kilometres. **Batch normalisation** puts every neuron back on the same scale between layers. For each column of `Z`, one neuron, it subtracts the batch's mean and divides by the batch's standard deviation.

The layer after it then always sees numbers of about the same size, whatever happened before, so training is steadier and can take bigger steps.

Here is the middle of it, given a batch.
