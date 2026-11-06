---
id: learn-sigmoid
type: learn
title: Squashing a score into a chance
concept: logistic-regression
code: |
  import numpy as np


  def sigmoid(z):
      return 1 / (1 + np.exp(-z))


  scores = np.array([-4.0, -1.0, 0.0, 1.0, 4.0])
  print(np.round(sigmoid(scores), 2))
---
The **sigmoid** takes any number and squashes it between 0 and 1:

```text
sigmoid(z) = 1 / (1 + np.exp(-z))
```

Say it as "one over one plus e to the minus `z`". Picture an S-shaped slide: far to the left it flattens out just above 0, far to the right just below 1, and it passes 0.5 exactly at 0. The example prints `[0.02 0.27 0.5  0.73 0.98]`.

**Logistic regression** works out a score as linear regression does, `X @ w + b`, then puts the score through the sigmoid. A big positive score becomes a chance near 1, and a big negative one a chance near 0.

The usual mistake is thinking a score of 0 means a chance of 0. It means 0.5: the model can't tell either way.
