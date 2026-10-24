---
id: investigate
type: investigate
title: Every threshold at once
concept: roc-auc
code: |
  import numpy as np
  import matplotlib.pyplot as plt

  table = np.loadtxt("storms.csv", delimiter=",", skiprows=1)
  chances = table[:, 1]
  storms = table[:, 2]


  def rates(threshold):
      warned = chances >= threshold
      caught = np.sum(warned & (storms == 1)) / np.sum(storms == 1)
      false_alarms = np.sum(warned & (storms == 0)) / np.sum(storms == 0)
      return false_alarms, caught


  for threshold in [0.5, 0.2, 0.05]:
      false_alarms, caught = rates(threshold)
      print(f"At {threshold}: caught {caught:.2f} of storms, warned on {false_alarms:.3f} of calm nights")

  fpr, tpr = [0.0], [0.0]
  for threshold in np.unique(chances)[::-1]:
      false_alarms, caught = rates(threshold)
      fpr.append(false_alarms)
      tpr.append(caught)

  area = 0.0
  for i in range(1, len(fpr)):
      area += (fpr[i] - fpr[i - 1]) * (tpr[i] + tpr[i - 1]) / 2
  print(f"AUC: {area:.3f}")

  plt.plot(fpr, tpr, marker=".", label="Penhallow's forecast")
  plt.plot([0, 1], [0, 1], linestyle="--", label="a coin")
  plt.xlabel("false positive rate: share of calm nights warned")
  plt.ylabel("true positive rate: share of storms caught")
  plt.legend()
  plt.show()
tasks:
  - id: at-a-half
    prompt: "Run it. At a threshold of 0.5, what share of the storms does the forecast catch?"
    kind: answer
    accept: ["0.48", ".48", "48%", "48"]
    feedback: "0.48: that's the recall, also called the true positive rate. Under half the storms."
    wrong: "Read the first printed line."
  - id: rank-meaning
    prompt: "The AUC is 0.950. Pick a random storm night and a random calm night. How often did the forecast give the storm night the higher chance? Answer as a share, to two places."
    kind: answer
    accept: ["0.95", ".95", "95%", "95"]
    feedback: "0.95. That's what the area means: how well the chances put storm nights above calm ones, whatever threshold you later choose."
    wrong: "The answer is already printed. It's the AUC, read a different way."
  - id: one-chance
    prompt: "A forecast that gives every night the same chance can't tell storms from calm at all. Add `chances = np.full(len(storms), 0.06)` after line 6 and run it. What is the AUC now?"
    kind: answer
    accept: ["0.5", "0.500", ".5", "0.50"]
    feedback: "0.5: the diagonal, a coin. One chance means one threshold, so the curve jumps straight from (0, 0) to (1, 1). An AUC of 0.5 is no skill at all; 0 would be perfectly backwards."
    wrong: "Did the curve on the chart turn into a single straight line? Read the AUC under it."
---
Each threshold gives one pair of numbers: the share of storms caught (the **true positive rate**, which is recall), and the share of calm nights warned for nothing (the **false positive rate**). A lower threshold catches more storms and raises more false alarms.

This program tries every chance in the notebook as a threshold, from the highest down. Each threshold is one point; together they trace the **ROC curve**, from (0, 0), warning on nothing, to (1, 1), warning on everything. A forecast with real skill bows up towards the top left corner.

The **area under the curve**, AUC, sums it up in one number: 1 is perfect, 0.5 is a coin. It adds up the curve in trapezoids, one between each pair of neighbouring points.
