---
id: learn-log
type: learn
title: Taming lopsided money
concept: feature-scaling
code: |
  import numpy as np

  frozen = np.array([500.0, 1200.0, 3000.0, 60000.0])    # a year's spending on frozen food
  print(np.log(frozen).round(2))
  print(np.log(frozen * 10).round(2))
---
Spending is lopsided. Most of the wholesaler's customers spend a few thousand a year on frozen food, and one spends sixty thousand. Standardised as it is, that one customer would sit far from everyone, and drag a centre all to itself.

Taking the **logarithm** first pulls the big numbers in. `np.log` turns 500 into 6.21 and 60,000 into 11: a customer spending ten times as much is now about 2.3 further along, whoever they are. So the log compares customers by how many times more they spend, not by how many pounds more. The second line shows it: every amount ten times bigger, every log 2.3 bigger.

Then standardise each column as usual, so every kind of goods counts alike.

The usual mistake is taking the log of a 0. `np.log(0)` is minus infinity.
