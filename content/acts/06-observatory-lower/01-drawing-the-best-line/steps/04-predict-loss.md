---
id: predict-loss
type: predict
title: Square, then average
concept: mean-squared-error
code: |
  import numpy as np

  guesses = np.array([3.0, 5.0, 7.0, 9.0])
  actual = np.array([3.0, 4.0, 4.0, 5.0])
  print(np.mean((guesses - actual) ** 2))
question: What does this print?
options:
  - text: "6.5"
    correct: true
    feedback: "Right. The misses are 0, 1, 3 and 4. Squared, they're 0, 1, 9 and 16, and the mean of those is 6.5."
  - text: "2.0"
    misconception: misses-can-cancel
    feedback: "2.0 is the mean of the misses themselves. The brackets are worked out first, then `** 2` squares each miss before `np.mean` averages them."
  - text: "4.0"
    misconception: square-of-mean-miss
    feedback: "That's the mean miss, 2, squared. Here each miss is squared first, then the squares are averaged: 0, 1, 9 and 16 make 6.5."
---
Four guesses and four real answers. Work out each miss, then follow the brackets.
