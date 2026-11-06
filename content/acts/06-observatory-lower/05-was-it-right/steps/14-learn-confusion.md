---
id: learn-confusion
type: learn
title: Two ways right, two ways wrong
concept: classification-metrics
code: |
  import numpy as np

  warned = np.array([1, 1, 0, 1, 0, 0, 0, 1])
  storm = np.array([1, 0, 0, 1, 0, 1, 0, 0])

  tp = np.sum((warned == 1) & (storm == 1))     # warned, and it came
  fp = np.sum((warned == 1) & (storm == 0))     # warned for nothing
  fn = np.sum((warned == 0) & (storm == 1))     # missed
  tn = np.sum((warned == 0) & (storm == 0))     # quiet, and nothing came
  print(tp, fp, fn, tn)
---
A yes-or-no forecast can be right in two ways and wrong in two:

```text
                 it happened       it didn't
warned           true positive     false positive
not warned       false negative    true negative
```

A **false positive** is a false alarm: warned, and nothing came. A **false negative** is a miss: no warning, and it came. "Positive" just means the forecast said yes.

Counting all four makes the **confusion matrix**, the table above with counts in it. The example's eight nights print `2 2 1 3`: two storms warned, two false alarms, one storm missed, and three quiet nights left quiet.

The usual mistake is counting only the right answers. The two kinds of wrong cost different things: for a clinic, a false alarm is a spare blood test, and a miss is a case nobody found.
