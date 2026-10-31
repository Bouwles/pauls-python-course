---
id: worked-counts
type: worked
title: How Paul would count it
dialogue:
  - paul: "The rain alert on my phone. Twenty days: did it warn, and did it rain?"
  - paul: "I'd rather it warned for nothing than left me soaked."
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
A yes-or-no forecast is right in two ways and wrong in two. Counting all four makes the **confusion matrix**:

```text
                 it happened       it didn't
warned           true positive     false positive (a false alarm)
not warned       false negative    true negative
                 (a miss)
```

**Precision** starts from the warnings: of the days it warned, the share that were right. **Recall** starts from the real cases: of the days it happened, the share that were warned. A forecast that warns every day has perfect recall and terrible precision; one that never warns has neither.

**F1** is their harmonic mean. It's high only when both are, so one good number can't hide a bad one.
