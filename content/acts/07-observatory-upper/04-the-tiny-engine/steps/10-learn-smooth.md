---
id: learn-smooth
type: learn
title: A jump has no slope
concept: activation-functions
code: |
  import math


  def step(total):
      return 1 if total > 0 else 0


  def sigmoid(total):
      return 1 / (1 + math.exp(-total))


  nudge = 1e-4
  for total in [-2.0, 0.5, 3.0]:
      step_slope = (step(total + nudge) - step(total - nudge)) / (2 * nudge)
      smooth_slope = (sigmoid(total + nudge) - sigmoid(total - nudge)) / (2 * nudge)
      print(total, step_slope, round(smooth_slope, 3))
---
The perceptron from Neural Network from Scratch jumps from 0 to 1 at a total of 0. Gradient descent can't steer it: everywhere except the jump the step is flat, so its slope is 0, and a slope of 0 says no direction is downhill. The example measures it: `0.0` at every total.

Swap the jump for a sigmoid and the neuron is smooth. It still goes from near 0 to near 1, but gently, with a slope everywhere, so gradient descent always knows which way to turn each weight.

A sigmoid neuron gives a chance, not a yes or no. Read it with a threshold of 0.5, as the diabetes model did.

The usual mistake is thinking a flat slope means you've reached the bottom. Sometimes the ground is a staircase.
