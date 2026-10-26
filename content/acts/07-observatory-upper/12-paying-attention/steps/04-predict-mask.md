---
id: predict-mask
type: predict
title: No looking ahead
concept: attention
dialogue:
  - pip: "To stop it looking ahead, I set the future scores to nothing. Zero. Done."
code: |
  import numpy as np


  def softmax(scores):
      exps = np.exp(scores - scores.max(axis=-1, keepdims=True))
      return exps / exps.sum(axis=-1, keepdims=True)


  scores = np.array([[1.0, 2.0, 3.0],
                     [1.0, 2.0, 3.0],
                     [1.0, 2.0, 3.0]])
  future = np.triu(np.ones((3, 3), dtype=bool), k=1)    # True above the diagonal

  masked = np.where(future, 0.0, scores)
  print(np.round(softmax(masked)[0], 2))
question: "The first character mustn't look at the second or third. What weights does it give them?"
options:
  - text: "[0.58 0.21 0.21]"
    correct: true
    feedback: "Right. A score of 0 isn't nothing to softmax: e to the 0 is 1, so the future still gets a fifth of the weight each. Use `-np.inf`: e to minus infinity is exactly 0."
  - text: "[1. 0. 0.]"
    misconception: mask-with-zero
    feedback: "That's what you want, but a score of 0 becomes `np.exp(0)`, which is 1, not 0. Only a score of minus infinity gets a weight of exactly 0."
  - text: "[0.09 0.24 0.67]"
    misconception: mask-ignored
    feedback: "`np.where(future, 0.0, scores)` does change the scores above the diagonal, to 0. The trouble is that 0 still gets a share."
after: |
  Run it. Then change `0.0` to `-np.inf` and run it again.
---
A model that writes text must guess each character from the ones before it only. In training it sees the whole line at once, so each query has to be stopped from looking at later keys, or it would learn to copy the answer. That's a **causal mask**: `True` above the diagonal, where row `i` would look at a later column `j`.
