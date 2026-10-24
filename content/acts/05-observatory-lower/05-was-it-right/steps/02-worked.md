---
id: worked
type: worked
title: How Moss would count it
dialogue:
  - moss: "Old Tom's fog horn. It sounds when the fog sensor says so. Twenty nights of his log."
  - moss: "He'd rather it sounded for nothing than stayed quiet in fog."
code: |
  import numpy as np

  # Old Tom's log, twenty nights: did the horn sound, and was there fog?
  horn = np.array([1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0])
  fog = np.array([1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0])

  tp = np.sum((horn == 1) & (fog == 1))
  fp = np.sum((horn == 1) & (fog == 0))
  fn = np.sum((horn == 0) & (fog == 1))
  tn = np.sum((horn == 0) & (fog == 0))

  print("            fog  clear")
  print(f"horn        {tp:3}  {fp:5}")
  print(f"no horn     {fn:3}  {tn:5}")

  precision = tp / (tp + fp)
  recall = tp / (tp + fn)
  f1 = 2 * precision * recall / (precision + recall)
  print(f"Precision {precision:.2f}: of the nights the horn sounded, the share with fog")
  print(f"Recall {recall:.2f}: of the foggy nights, the share the horn sounded")
  print(f"F1 {f1:.2f}")
subgoals:
  - label: The log
    lines: [3, 5]
  - label: Count the four kinds of night
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
  prompt: "Tom would rather the horn sounded on a clear night than stayed quiet in fog. Which should he watch more closely, precision or recall?"
  answer: "Recall. A quiet horn in fog is a false negative, a fog missed, and recall is the share of fogs that weren't missed. A horn on a clear night is a false positive, which only costs precision, and Tom can live with that."
  concept: classification-metrics
---
A yes-or-no forecast is right in two ways and wrong in two. Counting all four makes the **confusion matrix**:

```text
                 it happened       it didn't
warned           true positive     false positive (a false alarm)
not warned       false negative    true negative
                 (a miss)
```

**Precision** starts from the warnings: of the nights it warned, the share that were right. **Recall** starts from the real cases: of the nights it happened, the share that were warned. A forecast that warns every night has perfect recall and terrible precision; one that never warns has neither.

**F1** is their harmonic mean. It's high only when both are, so one good number can't hide a bad one.
