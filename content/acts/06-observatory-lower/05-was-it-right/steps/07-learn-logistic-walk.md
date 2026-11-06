---
id: learn-logistic-walk
type: learn
title: Walking down the log loss
concept: logistic-regression
code: |
  import numpy as np


  def sigmoid(z):
      return 1 / (1 + np.exp(-z))


  X = np.array([[-2.0], [-1.0], [1.0], [2.0]])    # one scaled reading
  y = np.array([0, 0, 1, 1])

  w, b = np.zeros(1), 0.0
  for step in range(200):
      chance = sigmoid(X @ w + b)
      miss = chance - y
      w = w - 0.5 * X.T @ miss / len(y)
      b = b - 0.5 * np.mean(miss)
  print(np.round(sigmoid(X @ w + b), 2))
---
Logistic regression learns its weights by gradient descent on the log loss. With the sigmoid inside it, the chain rule makes the slopes come out simply:

```text
dw = X.T @ (chance - y) / n
db = mean(chance - y)
```

Here `n` is the number of rows. It's the same shape as for linear regression, without the 2, and the miss is the chance minus the answer.

The example walks 200 steps on four respondents with one reading each. The two with low readings were no, the two with high ones yes, and the chances end near 0 for the first two and near 1 for the others.

The usual mistake is working the miss out from the score, `X @ w + b - y`. Then the walk fits a straight line to the 0s and 1s, and the sigmoid only squashes it afterwards.
