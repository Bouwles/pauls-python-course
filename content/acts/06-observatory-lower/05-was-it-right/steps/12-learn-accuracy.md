---
id: learn-accuracy
type: learn
title: When right isn't enough
concept: classification-metrics
dialogue:
  - paul.unimpressed: "Eighty-five per cent sounds good until you count what it missed."
code: |
  import numpy as np

  storm = np.array([0, 0, 0, 1, 0, 0, 0, 0, 0, 0])    # one stormy night in ten
  never_warns = np.zeros(10, dtype=int)

  print(np.mean(never_warns == storm))
  print(np.sum((never_warns == 1) & (storm == 1)))
---
**Accuracy** is the share of answers that were right. `np.mean(decisions == answers)` works it out, because `True` counts as 1.

It's a fair score when yes and no are about equally common. But when one answer is rare, accuracy rewards ignoring it. A forecast that never warns of a storm that comes one night in ten is right 9 nights in 10: the example prints `0.9`. It caught `0` storms, which is the one thing a storm warning is for.

`&` is "and", one pair at a time, for whole arrays, as in pandas filters. So the second line counts the nights it warned and a storm came.

About one respondent in eight has diabetes or prediabetes. The usual mistake is trusting accuracy when the thing you're after is that rare.
