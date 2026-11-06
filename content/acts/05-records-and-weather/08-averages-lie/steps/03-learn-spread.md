---
id: learn-spread
type: learn
title: How far from the middle
concept: descriptive-statistics
code: |
  import pandas as pd

  town = pd.Series([11.0, 12.0, 13.0])
  country = pd.Series([7.0, 12.0, 17.0])
  print(town.mean(), country.mean())
  print(town.std(), country.std())
---
Two places can share an average and have very different weather. The **standard deviation** says how far readings typically sit from their mean: small when they huddle close to it, big when they're spread out.

It's worked out in four moves: each reading's distance from the mean, squared, averaged, then the square root. The average of the squares, before the root, is the **variance**.

"Averaged" hides a choice. pandas' `values.std()` divides by one less than the number of readings, which suits a sample of something bigger. NumPy's `np.std()` divides by the number itself, so it comes out a little smaller.

The example prints `12.0 12.0`, then `1.0 5.0`: same mean, five times the spread. The usual slip is to think the same mean means the same weather.
