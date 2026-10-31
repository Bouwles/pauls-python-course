---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul: "My log for the roof terrace. Wind at noon, and whether I called off the lesson up there."
  - riya: "One reading, one yes or no. The same machine, smaller."
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
  prompt: "In the first job the miss was the line's prediction minus the reading. Here, line 18 uses the chance, after the sigmoid. Why not the score, `X @ w + b`?"
  answer: "The model's answer is the chance, so that's what gets compared with what happened, 0 or 1. The slope of the log loss works out to exactly the chance minus the answer, times the reading. Put the score in instead and the walk fits a straight line to the 0s and 1s, as in the predict step, and only squashes it afterwards."
  concept: logistic-regression
---
**Logistic regression** works out a score, `X @ w + b`, as linear regression does, then squashes it with the sigmoid into a chance.

How wrong is a chance? If the lesson was called off and the model said 0.9, that's nearly right; 0.1 is badly wrong. **Log loss**, also called **cross-entropy**, charges minus the log of the chance the model gave to what actually happened: 0.11 for 0.9, 2.3 for 0.1, and more without limit as that chance falls to 0. The mean over every day is the loss to walk down.

Its slopes have the shape you already know:

```text
dw = X.T @ (chance - cancelled) / n
db = mean(chance - cancelled)
```

The model only ever gives a chance. Paul's decision comes from comparing it with a **threshold**, here 0.5.
