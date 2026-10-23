---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "I don't trust it. But I can follow it. Here's my varnish."
  - moss: "Days since the coat went on, how warm the workshop was. Dry or not."
code: |
  import numpy as np

  # Moss's varnish log: days since varnishing, warmth of the workshop (0 to 1)
  coats = np.array([[0.5, 0.2], [1.5, 0.3], [1.0, 0.9], [1.0, 0.2],
                    [2.0, 0.1], [0.5, 0.7], [0.75, 1.0]])
  dry = [0, 1, 1, 0, 1, 0, 1]
  rate = 0.1

  weights = np.zeros(2)
  bias = 0.0

  for sweep in range(1, 31):
      mistakes = 0
      for coat, answer in zip(coats, dry):
          guess = 1 if np.dot(weights, coat) + bias > 0 else 0
          error = answer - guess
          weights = weights + rate * error * coat
          bias = bias + rate * error
          if error != 0:
              mistakes += 1
      print(f"Sweep {sweep}: {mistakes} wrong")
      if mistakes == 0:
          break

  print("Weights", weights, "bias", round(bias, 2))
subgoals:
  - label: Lay out the examples and the answers
    lines: [3, 7]
  - label: Start knowing nothing
    lines: [9, 10]
  - label: Sweep through every example
    lines: [12, 14]
  - label: Ask the neuron
    lines: [15, 15]
  - label: Nudge the weights by the error times the reading
    lines: [16, 18]
  - label: Count the mistakes; stop after a clean sweep
    lines: [19, 23]
explain:
  prompt: "Why does the bias change by `rate * error`, with no reading in it?"
  answer: "The bias is a weight on a reading that is always 1. Without it, the line has to pass through zero: a coat with every reading at 0 would total 0 whatever the weights, and the neuron could never move its threshold."
  concept: perceptron
---
A pass over every example is an **epoch**. Moss calls it a sweep, and stops sweeping once a whole sweep goes by without a mistake.

If a straight line can split the examples into yes and no, the perceptron is guaranteed to find one eventually. That is its one promise. Run it and watch the mistakes fall, not always steadily.
