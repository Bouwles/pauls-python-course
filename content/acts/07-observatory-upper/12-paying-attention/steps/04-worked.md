---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral.point: "One character asking, three answering. By hand, with loops, before anything clever."
code: |
  import numpy as np

  # The query: what the full stop in "fog." is looking for
  query = np.array([1.0, 0.0, 2.0, 1.0])

  # A key for each character before it: "f", "o", "g"
  keys = np.array([[1.0, 0.0, 1.0, 0.0],
                   [0.0, 1.0, 0.0, 1.0],
                   [2.0, 0.0, 2.0, 2.0]])
  # And what each one hands over
  values = np.array([[10.0, 0.0],
                     [0.0, 10.0],
                     [5.0, 5.0]])

  scores = []
  for key in keys:
      scores.append(query @ key / np.sqrt(len(key)))

  weights = np.exp(scores) / np.sum(np.exp(scores))

  output = np.zeros(2)
  for weight, value in zip(weights, values):
      output += weight * value

  print(np.round(scores, 2), np.round(weights, 2), np.round(output, 2))
subgoals:
  - label: The query, the keys and the values
    lines: [3, 13]
  - label: "Score: the query against every key, scaled by the square root of the size"
    lines: [15, 17]
  - label: Softmax the scores into weights
    lines: [19, 19]
  - label: Mix the values by the weights
    lines: [21, 23]
explain:
  prompt: "Why divide each score by the square root of the key's length?"
  answer: "A dot product of two rows of random numbers grows with their length, roughly as its square root. Without the division, long keys give huge scores, softmax puts nearly all the weight on one key, and hardly any blame flows back through it. Dividing by the square root keeps the scores about the same size whatever the length."
  concept: attention
---
One character asking and three answering, by hand, with loops: the full stop in "fog." looks back at "f", "o" and "g". Each score is scaled by the square root of the key's length, then softmax, then the values mixed.

"g" has the key that best matches the query, so the full stop takes most of its answer from "g". The labels beside the code are Paul's steps, and your `attention` does the same with matrices.
