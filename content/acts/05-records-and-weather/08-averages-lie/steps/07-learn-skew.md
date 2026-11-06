---
id: learn-skew
type: learn
title: The shape of a year
concept: distributions
code: |
  import pandas as pd

  rain = pd.Series([0, 0, 0, 0, 1, 1, 2, 3, 5, 18])
  print(rain.mean())
  print(rain.median())
---
A **distribution** is the shape of all the readings together: how many there are of each size. A histogram draws it.

A year of temperatures piles up in a hump, with about as many readings above the middle as below. Daily rain doesn't. Most days pile up at nought, and a few very wet days stretch away to the right in a long tail. That's a **skewed** distribution, skewed right.

The tail drags the mean out along it, past the median. The example's ten days print `3.0` for the mean and `1.0` for the median, and seven of the ten days had less rain than the mean.

The usual slip is to report the mean of a skewed set as "a typical day". The median is closer to one.
