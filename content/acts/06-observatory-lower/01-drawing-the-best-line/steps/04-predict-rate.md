---
id: predict-rate
type: predict
title: Square metres or hundreds
concept: gradient-descent
dialogue:
  - pip: "Same houses, same rate. Hundreds or ones, it's the same walk. It's only a unit."
code: |
  import numpy as np

  areas = np.array([116.1, 210.9, 315.9, 137.5, 197.9, 102.2])           # square metres
  prices = np.array([405000, 732350, 510000, 243000, 338500, 225500])    # dollars

  for per in [1, 100]:
      x = areas / per
      w, b = 0.0, 0.0
      losses = []
      for step in range(20):
          miss = w * x + b - prices
          losses.append(np.mean(miss ** 2))
          w = w - 0.1 * 2 * np.mean(miss * x)
          b = b - 0.1 * 2 * np.mean(miss)
      if losses[-1] < losses[0]:
          print(per, "downhill")
      else:
          print(per, "uphill")
question: What does this print?
options:
  - text: |-
      1 downhill
      100 downhill
    misconception: feature-scale-irrelevant
    feedback: "The size of the numbers decides how steep the loss is. Areas of 100 to 300, squared, make it steep in the `w` direction: tens of thousands of times steeper than in the `b` direction. A rate of 0.1 overshoots that badly, and every step lands higher up the far side."
  - text: |-
      1 uphill
      100 downhill
    correct: true
    feedback: "Right. In square metres, `w`'s slope is enormous and each step of 0.1 times it flies past the valley. In hundreds, the areas are 1 to 3, the slope is gentle, and the same rate walks down. The houses didn't change. The hill did."
  - text: "It stops with an OverflowError on the first walk"
    misconception: divergence-raises-error
    error: OverflowError
    feedback: "Nothing stops it. After 20 steps `w` is a number with over 80 digits, and NumPy carries on without a word. Gradient descent never complains when it goes wrong. You have to watch the loss yourself."
after: |
  Run it, then add `print(np.round(losses[:4]))` as the last line of the outer loop to see the first four losses each way.
---
Here is the walk on six of the sales, at the same rate, 0.1, and twenty steps each: once with the areas in square metres, once in hundreds of square metres. Same houses, same line at the bottom of the valley.

Predict which way each walk goes.
