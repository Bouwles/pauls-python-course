---
id: learn-boosting
type: learn
title: Each tree fixes the last
concept: ensembles
code: |
  import numpy as np

  x = np.array([1, 2, 3, 4])
  y = np.array([3.0, 5.0, 9.0, 11.0])

  prediction = np.full(4, y.mean())             # start from the mean
  for round_number in range(3):
      leftover = y - prediction                 # what's still wrong
      small = x <= 2.5                          # one question, a stump
      stump = np.where(small, leftover[small].mean(), leftover[~small].mean())
      prediction = prediction + 0.5 * stump     # add a little of it
      print(prediction)
---
A forest grows its trees side by side, each on its own. **Gradient boosting** grows them one after another, each fixing what the trees before it got wrong.

It starts with the dullest guess there is: the mean. Then, round after round, it works out what's left over, `y - prediction`, grows a small tree on those leftovers, and adds a little of that tree's answer, scaled by a learning rate. The trees here are **stumps**: one question each.

In the example the guesses start at 7, the mean, and creep towards 4 and 10 with every round: the best one question can do. More questions would get closer still. The leftovers are the downhill direction of the squared error, so each round is a step of gradient descent: hence the name.

The usual mistake is adding each tree's whole answer. Small steps let later trees correct earlier ones.
