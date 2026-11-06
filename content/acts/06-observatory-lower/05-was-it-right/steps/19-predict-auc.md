---
id: predict-auc
type: predict
title: Half the chance
concept: roc-auc
code: |
  import numpy as np


  def auc(y, chance):
      fpr, tpr = [0.0], [0.0]
      for threshold in np.unique(chance)[::-1]:
          warned = chance >= threshold
          tpr.append(np.sum(warned & (y == 1)) / np.sum(y == 1))
          fpr.append(np.sum(warned & (y == 0)) / np.sum(y == 0))
      fpr, tpr = np.array(fpr), np.array(tpr)
      return round(float(np.sum((fpr[1:] - fpr[:-1]) * (tpr[1:] + tpr[:-1]) / 2)), 3)


  storm = np.array([1, 0, 1, 0, 0])
  chance = np.array([0.9, 0.7, 0.6, 0.3, 0.2])
  print(auc(storm, chance), auc(storm, chance / 2))
question: What does this print?
options:
  - text: "0.833 0.833"
    correct: true
    feedback: "Right. Halving every chance keeps them in the same order, and the AUC only cares about the order. Of the six pairs of a storm and a quiet night, five have the storm higher: 5 in 6 is 0.833."
  - text: "0.833 0.417"
    misconception: auc-needs-true-chances
    feedback: "The AUC doesn't use the size of the chances, only their order. Halved, the storms still sit above the same quiet nights."
  - text: "0.6 0.6"
    misconception: auc-is-accuracy
    feedback: "The AUC isn't an accuracy at any one threshold. It's how often a storm got a higher chance than a quiet night: five of the six pairs."
---
`auc` adds up the area under the ROC curve in thin strips, each a trapezoid. It's called twice: once with the chances, once with every chance halved.
