---
id: investigate
type: investigate
title: Every threshold at once
concept: roc-auc
code: |
  import numpy as np
  from sklearn.linear_model import LogisticRegression

  table = np.loadtxt("diabetes.csv", delimiter=",", skiprows=1)
  X, y = table[:, 1:-1], table[:, -1]

  # The same split and scaling as your program, then the same model, from scikit-learn
  order = np.random.default_rng(4).permutation(len(X))
  test, train = order[:500], order[500:]
  means, spreads = X[train].mean(axis=0), X[train].std(axis=0)
  model = LogisticRegression(C=1e6).fit((X[train] - means) / spreads, y[train])
  chances = model.predict_proba((X[test] - means) / spreads)[:, 1]
  cases = y[test]


  def rates(threshold):
      flagged = chances >= threshold
      caught = np.sum(flagged & (cases == 1)) / np.sum(cases == 1)
      false_alarms = np.sum(flagged & (cases == 0)) / np.sum(cases == 0)
      return false_alarms, caught


  for threshold in [0.5, 0.2, 0.1]:
      false_alarms, caught = rates(threshold)
      print(f"At {threshold}: caught {caught:.2f} of cases, flagged {false_alarms:.3f} of the rest")

  fpr, tpr = [0.0], [0.0]
  for threshold in np.unique(chances)[::-1]:
      false_alarms, caught = rates(threshold)
      fpr.append(false_alarms)
      tpr.append(caught)

  area = 0.0
  for i in range(1, len(fpr)):
      area += (fpr[i] - fpr[i - 1]) * (tpr[i] + tpr[i - 1]) / 2
  print(f"AUC: {area:.3f}")
tasks:
  - id: at-a-half
    prompt: "Run it. At a threshold of 0.5, what share of the cases does the model catch?"
    kind: answer
    accept: ["0.11", ".11", "11%", "11"]
    feedback: "0.11: that's the recall, also called the true positive rate. One case in nine."
    wrong: "Read the first printed line."
  - id: rank-meaning
    prompt: "The AUC is 0.811. Pick a random respondent with diabetes and a random one without. How often does the model give the one with diabetes the higher chance? Answer as a share, to two places."
    kind: answer
    accept: ["0.81", ".81", "81%", "81"]
    feedback: "0.81. That's what the area means: how well the chances put cases above everyone else, whatever threshold you later choose."
    wrong: "The answer is already printed. It's the AUC, read a different way."
  - id: one-chance
    prompt: "A model that gives everyone the same chance can't tell anyone apart. Add `chances = np.full(len(cases), 0.13)` after the line that sets `cases`, and run it. What is the AUC now?"
    kind: answer
    accept: ["0.5", "0.500", ".5", "0.50"]
    feedback: "0.5: the diagonal, a coin. One chance means one threshold, so the curve jumps straight from (0, 0) to (1, 1). An AUC of 0.5 is no skill at all."
    wrong: "Read the AUC on the last line."
---
Each threshold gives one pair of numbers: the share of cases caught (the **true positive rate**, which is recall), and the share of everyone else flagged for nothing (the **false positive rate**). A lower threshold catches more cases and flags more people who are fine.

This program fits the same model with scikit-learn, then tries every chance it gives as a threshold, from the highest down. Each threshold is one point; together they trace the **ROC curve**, from (0, 0), flagging nobody, to (1, 1), flagging everyone.

The **area under the curve**, AUC, sums it up in one number: 1 is perfect, 0.5 is a coin. It adds up the curve in trapezoids.
