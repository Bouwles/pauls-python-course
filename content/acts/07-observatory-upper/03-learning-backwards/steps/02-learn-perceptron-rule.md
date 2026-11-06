---
id: learn-perceptron-rule
type: learn
title: Learning from mistakes
concept: perceptron
code: |
  import numpy as np

  weights = np.array([0.0, 0.0])
  bias = 0.0
  rate = 0.5

  night = np.array([0.4, 1.0])       # one night's readings
  label = 1                          # it went ahead

  guess = 1 if np.dot(weights, night) + bias > 0 else 0
  error = label - guess
  weights = weights + rate * error * night
  bias = bias + rate * error
  print(guess, error, weights, bias)
---
A perceptron starts knowing nothing, every weight 0, and learns from a log one example at a time.

When it guesses right, nothing changes. When it's wrong, the **error**, `label - guess`, is 1 or -1. Every weight moves by `rate * error * reading`, and the bias by `rate * error`. A big reading moves its weight a lot; a reading of 0 doesn't move it at all.

In the example the total is 0, so it guesses 0, but the night went ahead: an error of 1. The weights move towards that night's readings, to `[0.2 0.5]`, and the bias to `0.5`. Next time a night like it comes along, the total is above 0.

The usual mistake is thinking it changes after every example. It only changes when it's wrong.
