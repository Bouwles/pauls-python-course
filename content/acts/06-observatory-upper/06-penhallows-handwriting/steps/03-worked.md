---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Mira's parcels. Weight and length, and three sacks: letters, small parcels, large."
  - moss: "One layer will do. Same ending as Wendt's ten digits."
code: |
  import numpy as np

  # Weight (kg) and length (m) of eight parcels, and which sack each went in
  parcels = np.array([[0.1, 0.3], [0.2, 0.2], [0.1, 0.25], [1.5, 0.4],
                      [2.0, 0.5], [1.2, 0.6], [6.0, 1.0], [8.0, 1.2]])
  sacks = np.array([0, 0, 0, 1, 1, 1, 2, 2])     # letters, small, large
  answers = np.eye(3)[sacks]                     # one-hot: a 1 in the right column

  W = np.zeros((2, 3))
  b = np.zeros(3)
  for step in range(3000):
      scores = parcels @ W + b                   # (8, 3)
      shifted = scores - scores.max(axis=1, keepdims=True)
      chances = np.exp(shifted) / np.exp(shifted).sum(axis=1, keepdims=True)
      loss = -np.mean(np.log(chances[np.arange(len(sacks)), sacks]))
      d_scores = (chances - answers) / len(sacks)
      W -= 0.5 * parcels.T @ d_scores
      b -= 0.5 * d_scores.sum(axis=0)

  print(f"Loss {loss:.3f}")
  print("Sacks:", chances.argmax(axis=1))
subgoals:
  - label: "The answers, one-hot: a 1 in the right column"
    lines: [3, 7]
  - label: "Scores: one column per class"
    lines: [11, 12]
  - label: "Softmax: shift by the row's biggest, exponentiate, divide by the row's total"
    lines: [13, 14]
  - label: "Cross-entropy: minus the log of the chance given to the right answer"
    lines: [15, 15]
  - label: "Blame at the scores: chances minus the one-hot answers, over n"
    lines: [16, 18]
  - label: "Read off the answer: the biggest column"
    lines: [20, 21]
explain:
  prompt: "`keepdims=True` keeps `scores.max(axis=1)` as an (8, 1) column. What would go wrong with the (8,) row you get without it?"
  answer: "Broadcasting lines up the last axis, so an (8,) row would be subtracted across each parcel's three columns, not down them. With three classes and eight parcels it crashes; with eight classes and eight parcels it would quietly subtract the wrong numbers. The column shape makes each row lose its own biggest score."
  concept: classification-networks
---
**Cross-entropy** is the loss for choosing one answer: minus the log of the chance the brain gave the right one. Sure and right costs almost nothing; sure and wrong costs a great deal.

Softmax followed by cross-entropy has the tidiest gradient in the building: at the scores it's just `chances - answers`, divided by the number of rows. Too much chance on a wrong sack is blamed; too little on the right one is blamed the other way.
