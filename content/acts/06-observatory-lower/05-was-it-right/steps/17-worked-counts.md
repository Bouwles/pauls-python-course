---
id: worked-counts
type: worked
title: How Paul would count it
dialogue:
  - paul.neutral.point: "The rain alert on my phone. Twenty days: did it warn, and did it rain?"
  - paul.unimpressed: "I'd rather it warned for nothing than left me soaked."
code: |
  import numpy as np

  # Paul's rain alert, twenty days: did it warn, and did it rain?
  alert = np.array([1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0])
  rain = np.array([1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0])

  tp = np.sum((alert == 1) & (rain == 1))
  fp = np.sum((alert == 1) & (rain == 0))
  fn = np.sum((alert == 0) & (rain == 1))
  tn = np.sum((alert == 0) & (rain == 0))

  print("            rain  dry")
  print(f"alert       {tp:4}  {fp:3}")
  print(f"no alert    {fn:4}  {tn:3}")

  precision = tp / (tp + fp)
  recall = tp / (tp + fn)
  f1 = 2 * precision * recall / (precision + recall)
  print(f"Precision {precision:.2f}: of the days it warned, the share with rain")
  print(f"Recall {recall:.2f}: of the rainy days, the share it warned")
  print(f"F1 {f1:.2f}")
subgoals:
  - label: The log
    lines: [3, 5]
  - label: Count the four kinds of day
    lines: [7, 10]
  - label: Draw the table
    lines: [12, 14]
  - label: Precision, from the warnings
    lines: [16, 16]
  - label: Recall, from the real cases
    lines: [17, 17]
  - label: F1, for both at once
    lines: [18, 21]
explain:
  prompt: "Paul would rather the alert warned on a dry day than stayed quiet before rain. Which should he watch more closely, precision or recall?"
  answer: "Recall. Silence before rain is a false negative, a rainy day missed, and recall is the share of rainy days that were warned. A warning on a dry day is a false positive, which only costs precision, and Paul can live with an umbrella he didn't need."
  concept: classification-metrics
---
Paul's rain alert, scored the way you'll score the clinic's model. Every part is from the last three Learn steps: count the four kinds of day, draw the confusion matrix, then precision, recall and F1.

The labels beside the code are Paul's steps, and the second half of your Build uses the same ones. Run it, then answer the question underneath.
