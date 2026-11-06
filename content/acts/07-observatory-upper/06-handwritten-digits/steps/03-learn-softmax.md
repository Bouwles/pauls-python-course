---
id: learn-softmax
type: learn
title: Ten scores into ten chances
concept: classification-networks
code: |
  import numpy as np

  scores = np.array([[2.0, 1.0, 0.0],
                     [5.0, 5.0, 5.0]])           # two digits, three possible answers

  shifted = scores - scores.max(axis=1, keepdims=True)
  chances = np.exp(shifted) / np.exp(shifted).sum(axis=1, keepdims=True)
  print(chances.round(3))
  print(chances.sum(axis=1))
---
Every network so far said yes or no. This one picks one answer out of ten, so its last layer gives ten scores per digit, one for each answer.

**Softmax** turns a row of scores into chances. Exponentiate each score with `np.exp`, then divide by the row's total. Every chance is above 0, each row adds up to 1, and the biggest score gets the biggest chance. The sigmoid did this for two answers; softmax does it for any number.

Taking the row's biggest score off first changes nothing, and stops `np.exp` overflowing. `keepdims=True` keeps each row's maximum and total as a column, so each row uses its own. Three equal scores give three chances of `0.333`.

The usual mistake is exponentiating big scores straight away. `np.exp(1000)` is too big for a float.
