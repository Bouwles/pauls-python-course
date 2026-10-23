---
id: investigate
type: investigate
title: Reading a validation curve
concept: overfitting
code: |
  import numpy as np
  import matplotlib.pyplot as plt

  readings = np.loadtxt("cooling.csv", delimiter=",", skiprows=1)
  hours = readings[:, 1]
  difference = readings[:, 2]

  # Shuffle, then hold back 20 readings for validation
  rng = np.random.default_rng(274)
  order = rng.permutation(len(hours))
  val, train = order[:20], order[20:]


  def polynomial_features(x, degree):
      return np.column_stack([x ** power for power in range(degree + 1)])


  degrees = list(range(1, 11))
  train_errors, val_errors = [], []
  print("degree  training  validation")
  for degree in degrees:
      weights = np.linalg.lstsq(polynomial_features(hours[train], degree), difference[train], rcond=None)[0]
      train_fit = polynomial_features(hours[train], degree) @ weights
      val_fit = polynomial_features(hours[val], degree) @ weights
      train_errors.append(np.mean((train_fit - difference[train]) ** 2))
      val_errors.append(np.mean((val_fit - difference[val]) ** 2))
      print(f"{degree:6}  {train_errors[-1]:8.3f}  {val_errors[-1]:10.3f}")

  plt.plot(degrees, train_errors, marker="o", label="training")
  plt.plot(degrees, val_errors, marker="o", label="validation")
  plt.yscale("log")
  plt.xlabel("degree")
  plt.ylabel("mean squared error")
  plt.legend()
  plt.show()
tasks:
  - id: lowest-training
    prompt: "Run it. Which degree has the lowest training error?"
    kind: answer
    accept: ["10", "degree 10"]
    feedback: "10. Training error only ever goes down as the degree goes up: a degree-10 curve can do anything a degree-9 curve can, and bend once more."
    wrong: "Read down the training column for the smallest number."
  - id: lowest-validation
    prompt: "Which degree has the lowest validation error?"
    kind: answer
    accept: ["3", "degree 3"]
    feedback: "3, at 0.097, just ahead of degree 4. That's the one to choose."
    wrong: "Read down the validation column for the smallest number."
  - id: degree-one
    prompt: "At degree 1, both errors are high. Is that overfitting or underfitting?"
    kind: answer
    accept: ["underfitting", "underfit", "under", "under-fitting"]
    feedback: "Underfitting. A straight line is too stiff for a curve, so it's wrong on the readings it learnt from and the new ones alike."
    wrong: "Is a straight line too flexible for a curve, or not flexible enough?"
  - id: degree-ten
    prompt: "At degree 10, the training error is the lowest of all and the validation error is the highest. Overfitting or underfitting?"
    kind: answer
    accept: ["overfitting", "overfit", "over", "over-fitting"]
    feedback: "Overfitting. The curve has followed the noise in its 40 training readings, and pays for it on every reading it hasn't seen."
    wrong: "Is it doing too well on the readings it learnt from, or too badly?"
---
Pip's curve has a name: it **overfits**. Flexible enough to follow every wobble, it follows the noise instead of the mirror. The opposite is **underfitting**: too stiff to follow the real shape at all.

The honest test is readings the curve has never seen. This program shuffles Penhallow's sixty readings, holds 20 back for **validation**, fits every degree from 1 to 10 on the other 40, and scores each on both. The two errors plotted against the degree make a **validation curve**. The chart's error axis is logarithmic, or degree 10 would flatten everything else.

Run it, then read the table and the chart.
