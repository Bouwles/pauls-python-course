---
id: learn-cross-entropy
type: learn
title: How wrong is a choice?
concept: classification-networks
code: |
  import numpy as np

  chances = np.array([[0.7, 0.2, 0.1],
                      [0.1, 0.1, 0.8],
                      [0.3, 0.4, 0.3]])
  labels = np.array([0, 2, 0])

  right = chances[np.arange(3), labels]       # each row's chance for its right answer
  print(right)
  print(round(-np.mean(np.log(right)), 3))
---
The loss for choosing one answer is **cross-entropy**, the diabetes model's log loss grown to many answers. Each row is charged minus the log of the chance it gave the right answer, and the loss is the mean. Sure and right costs almost nothing; sure and wrong costs a great deal.

`chances[np.arange(3), labels]` picks one chance from each row: row 0's in column 0, row 1's in column 2, row 2's in column 0. Those are the chances given to the right answers, `[0.7 0.8 0.3]`, and the loss is `0.595`.

The other columns aren't charged directly. Their chances add up to 1 with the right one's, so more on the right answer means less on the rest.

The usual mistake is charging every column, as if each were its own yes or no.
