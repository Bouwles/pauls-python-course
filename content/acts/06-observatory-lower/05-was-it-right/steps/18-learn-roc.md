---
id: learn-roc
type: learn
title: Every threshold at once
concept: roc-auc
code: |
  import numpy as np

  storm = np.array([1, 0, 1, 0, 0])
  chance = np.array([0.9, 0.7, 0.6, 0.3, 0.2])

  for threshold in np.unique(chance)[::-1]:       # every chance, highest first
      warned = chance >= threshold
      tpr = np.sum(warned & (storm == 1)) / np.sum(storm == 1)
      fpr = np.sum(warned & (storm == 0)) / np.sum(storm == 0)
      print(threshold, round(fpr, 2), tpr)
---
Each threshold gives two numbers. The **true positive rate** is the share of real cases caught: the recall. The **false positive rate** is the share of everyone else warned for nothing. Lower the threshold and both rise.

Try every chance the model gave as the threshold, highest first, and plot each pair: false positive rate along the bottom, true positive rate up the side. That's the **ROC curve**, from (0, 0), warning nobody, to (1, 1), warning everyone.

The **area under the curve**, the **AUC**, sums up every threshold at once. It's the chance that a random real case got a higher chance than a random non-case: 1 is perfect, 0.5 is a coin.

The usual mistake is reading the AUC as an accuracy. It measures how well the chances put the cases in order.
