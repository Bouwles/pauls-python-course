---
id: learn-leak
type: learn
title: A column that knows the answer
concept: data-leakage
code: |
  import numpy as np

  came = np.array([1, 0, 1, 1, 0, 1, 0, 1])
  signed_book = came.copy()            # signed on the night, so only by those who came
  days_ahead = np.array([3, 30, 5, 2, 40, 25, 21, 4])

  print(np.mean(signed_book == came))
  print(np.mean((days_ahead < 10) == came))
---
**Data leakage** is when the training data gives the answer away in a way that won't be there when the model is used for real. The scores look wonderful, and the model is useless. Picture a student marking their own paper with the answer sheet open.

The commonest leak is a column filled in after the event. Only people who came could sign Neil's visitors' book, so it matches who came every time: the example prints `1.0`. But a forecast is made at booking, before anyone has signed anything. How far ahead they booked is known then, and scores an honest `0.875`.

So ask of every column: is it known at the moment the forecast is made?

The usual mistake is treating a suspiciously high score as good news. It's a reason to look for a leak.
