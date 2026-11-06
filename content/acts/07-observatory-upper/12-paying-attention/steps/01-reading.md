---
id: reading
type: learn
title: Questions, labels and contents
concept: attention
dialogue:
  - neil.proud.point: "My blackboard. Q, K, V. Nobody rub this one out."
code: |
  import numpy as np

  query = np.array([1.0, 0.0])                  # what this character is after
  keys = np.array([[1.0, 0.0],                  # each earlier character's label
                   [0.0, 1.0],
                   [0.5, 0.5]])
  values = np.array([10.0, 20.0, 30.0])         # and what each one hands over

  scores = keys @ query                         # how well each label matches
  weights = np.exp(scores) / np.exp(scores).sum()
  print(scores, np.round(weights, 2))
  print(round(float(weights @ values), 1))
---
A bigram looks one character back. **Attention** lets every character look back at all the ones before it, and decide how much each one matters.

Picture a wall of pigeonholes in a post room. You come in with a **query**: what you're after. Each pigeonhole has a **key**, its label, and holds a **value**, its contents. You don't take one pigeonhole. You take a little from every one, more from those whose labels best match your query.

In numbers, each is a short row. A query's score against a key is their dot product: big when they point the same way. Softmax turns the scores into weights that add up to 1, and the answer is the values mixed by those weights: here `18.0`.

The usual mistake is thinking it picks the best match. It mixes them all.
