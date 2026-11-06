---
id: predict-std
type: predict
title: Two kinds of spread
concept: descriptive-statistics
dialogue:
  - yahya.proud: "Standard deviation. I'll use NumPy's, it's faster. Same answer anyway."
code: |
  import numpy as np
  import pandas as pd

  readings = [10.0, 12.0, 14.0]
  print(round(np.std(readings), 2), round(pd.Series(readings).std(), 2))
question: What does this print?
options:
  - text: "1.63 2.0"
    correct: true
    feedback: "Right. Both square each reading's distance from the mean and add them up, 8 here. NumPy divides by the count, 3; pandas divides by one less, 2, then both take the square root."
  - text: "1.63 1.63"
    misconception: std-same-everywhere
    feedback: "That's Yahya's guess. NumPy's `std` divides by the number of readings; pandas' divides by one less, which suits readings that are a sample of something bigger. With three readings, the gap is large."
  - text: "2.0 2.0"
    misconception: std-same-everywhere
    feedback: "pandas gives 2.0, but NumPy doesn't. Its `std` divides by the count, 3, not by one less, so it comes out smaller: 1.63."
after: |
  Run it. Then try `np.std(readings, ddof=1)`, which tells NumPy to divide by one less, like pandas.
---
Three readings, and the standard deviation worked out by NumPy and by pandas.
