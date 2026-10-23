---
id: predict-rate
type: predict
title: A bigger stride
concept: gradient-descent
dialogue:
  - pip: "Bigger rate, bigger steps, done sooner. I'd use 0.1. I'd use 1, honestly."
code: |
  import numpy as np

  temperatures = np.array([-0.8, 5.5, 7.2, 12.8, 3.3, 10.4])
  focus = np.array([42.45, 41.64, 41.41, 40.77, 41.93, 41.02])

  for rate in [0.01, 0.1]:
      w, b = 0.0, 0.0
      losses = []
      for step in range(100):
          miss = w * temperatures + b - focus
          losses.append(np.mean(miss ** 2))
          w = w - rate * 2 * np.mean(miss * temperatures)
          b = b - rate * 2 * np.mean(miss)
      if losses[-1] < losses[0]:
          print(rate, "downhill")
      else:
          print(rate, "uphill")
question: What does this print?
options:
  - text: |-
      0.01 downhill
      0.1 downhill
    misconception: bigger-rate-always-faster
    feedback: "A bigger rate only helps while each step lands lower than the last. How big a step is safe depends on how steep the loss is, and temperatures up to 13, squared, make it steep in the `w` direction. At 0.1 every step overshoots the valley and lands higher up the other side."
  - text: |-
      0.01 downhill
      0.1 uphill
    correct: true
    feedback: "Right. At 0.1 every step overshoots the valley and lands higher up the far side, each time further than the last. After 100 steps the loss is a number with over 200 digits."
  - text: "It stops with an OverflowError at 0.1"
    misconception: divergence-raises-error
    error: OverflowError
    feedback: "Nothing stops it. The numbers just grow: after 100 steps `w` is minus 10 to the power 106, give or take. Gradient descent never complains when it goes wrong. You have to watch the loss yourself."
after: |
  Run it, then add `print(np.round(losses[:4]))` as the last line of the outer loop to see the first four losses at each rate. In the worked example, a rate of 0.06 sent the hiker over the top in the same way.
---
On the hill-walker, any rate up to 1 went downhill. Here is the same walk on six of Penhallow's nights, with two learning rates and 100 steps each.

Predict which way each one goes.
