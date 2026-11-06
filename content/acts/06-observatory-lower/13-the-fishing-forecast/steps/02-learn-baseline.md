---
id: learn-baseline
type: learn
title: Compared with what?
concept: baselines
code: |
  import numpy as np

  good = np.array([0, 1, 0, 1, 1, 0, 0, 1, 0, 0])          # ten days: 1 for a good day
  tide_range = np.array([3.1, 4.5, 3.8, 2.9, 4.2, 4.6, 3.0, 4.1, 3.5, 3.3])
  wind = np.array([12, 15, 8, 25, 18, 24, 10, 9, 14, 30])

  always_no = np.zeros(10, dtype=int)
  skipper = ((tide_range >= 4.0) & (wind < 20)).astype(int)
  print(np.mean(always_no == good))
  print(np.mean(skipper == good))
---
A score means nothing on its own. "Right 85 days in 100" is excellent if guessing gets 50, and poor if guessing gets 90.

A **baseline** is the simplest forecast that could work, scored on the same days: always the commonest answer, tomorrow the same as today, or the rule the old hands use. A model is only worth having if it beats them. You met one in the diabetes screening: saying no to everyone.

The fleet has two. Always saying no, since most days aren't good: right `0.6` of the example's ten days. And the skipper's rule, good when the tide range is 4 m or more and the wind under 20 knots: right `0.9`.

The usual mistake is comparing a model with a coin. Compare it with what people would do without it.
