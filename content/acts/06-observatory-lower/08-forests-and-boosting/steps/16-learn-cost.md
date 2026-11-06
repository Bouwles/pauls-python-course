---
id: learn-cost
type: learn
title: What a mistake costs
concept: classification-metrics
code: |
  import numpy as np

  repaid = np.array([1, 1, 0, 1, 0, 1, 1, 1])
  approved = np.array([1, 1, 1, 1, 0, 1, 0, 1])

  bad_approved = np.sum((approved == 1) & (repaid == 0))
  good_declined = np.sum((approved == 0) & (repaid == 1))
  print(bad_approved, good_declined)
  print((5 * bad_approved + good_declined) / len(repaid))
---
Accuracy counts every mistake the same. A bank doesn't. Its own figures say approving a loan that isn't repaid costs five times as much as turning down one that would have been.

So score the models by **cost**: 5 for each bad loan approved, 1 for each good one declined, divided by the number of applicants. Lower is better. In the example, one bad loan approved and one good one declined cost `0.75` an applicant.

When one mistake costs more, move the threshold. A forest gives the share of its trees that say approve. Approving only when five trees in six agree turns away more good applicants, but far fewer bad ones get through.

The usual mistake is choosing a model by accuracy when its two kinds of mistake cost different amounts.
