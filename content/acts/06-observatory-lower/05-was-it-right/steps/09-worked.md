---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral.point: "My log for the roof terrace. Wind at noon, and whether I called off the lesson up there."
  - aaesha.thinking: "One reading, one yes or no. A decision, with a line drawn somewhere."
code: |
  import numpy as np

  # Paul's log: wind in knots, and 1 if the roof lesson was called off
  wind = np.array([8, 12, 15, 18, 20, 22, 25, 27, 30, 33, 36, 40])
  cancelled = np.array([0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1])

  X = ((wind - wind.mean()) / wind.std()).reshape(-1, 1)


  def sigmoid(z):
      return 1 / (1 + np.exp(-z))


  w = np.zeros(1)
  b = 0.0
  for step in range(500):
      chance = sigmoid(X @ w + b)
      miss = chance - cancelled
      w = w - 0.5 * X.T @ miss / len(cancelled)
      b = b - 0.5 * np.mean(miss)

  loss = -np.mean(cancelled * np.log(chance) + (1 - cancelled) * np.log(1 - chance))
  print(f"Log loss: {loss:.3f}")

  for knots in [15, 24, 35]:
      score = (knots - wind.mean()) / wind.std() * w[0] + b
      chance = sigmoid(score)
      decision = "call it off" if chance >= 0.5 else "go up"
      print(f"{knots} knots: {chance:.0%} chance of cancelling, so {decision}")
subgoals:
  - label: The log
    lines: [3, 5]
  - label: Scale it
    lines: [7, 7]
  - label: Squash a score into a chance
    lines: [10, 11]
  - label: Start from a guess
    lines: [14, 15]
  - label: Take many steps
    lines: [16, 16]
  - label: Measure the miss
    lines: [17, 18]
  - label: Step downhill
    lines: [19, 20]
  - label: Measure the log loss
    lines: [22, 23]
  - label: Decide with a threshold
    lines: [25, 29]
explain:
  prompt: "In the House Price Predictor the miss was the line's guess minus the price. Here, line 18 uses the chance, after the sigmoid. Why not the score, `X @ w + b`?"
  answer: "The model's answer is the chance, so that's what gets compared with what happened, 0 or 1. The slope of the log loss works out to exactly the chance minus the answer, times the reading. Put the score in instead and the walk fits a straight line to the 0s and 1s, like the BMI line, and only squashes it afterwards."
  concept: logistic-regression
---
Paul's roof-terrace log: the wind at noon, and whether he called off the lesson up there. Every part is one you've just met: scale the reading, squash a score into a chance with the sigmoid, walk down the log loss, then decide with a threshold of 0.5.

The labels beside the code are Paul's steps, and your Build uses the same ones. Run it, and look at the three decisions at the end.
