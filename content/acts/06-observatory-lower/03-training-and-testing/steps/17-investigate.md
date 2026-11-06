---
id: investigate
type: investigate
title: Reading a validation curve
concept: overfitting
dialogue:
  - paul.surprised: "Six students were absent thirty times or more. One, seventy-five times."
code: |
  import numpy as np
  import pandas as pd
  import matplotlib.pyplot as plt

  students = pd.read_csv("students.csv")
  X = students[["first_term", "study_time", "failures", "going_out", "absences"]].to_numpy(dtype=float)
  finals = students["final"].to_numpy(dtype=float)

  # Shuffle, then hold back 90 students for validation
  rng = np.random.default_rng(274)
  order = rng.permutation(len(finals))
  val, train = order[:90], order[90:]


  def fit_and_score(degree):
      powers = [X[:, -1] ** power for power in range(2, degree + 1)]
      wide = np.column_stack([X] + powers)
      means, spreads = wide[train].mean(axis=0), wide[train].std(axis=0)
      table = np.column_stack([(wide - means) / spreads, np.ones(len(wide))])
      weights = np.linalg.lstsq(table[train], finals[train], rcond=None)[0]
      errors = (table @ weights - finals) ** 2
      return np.mean(errors[train]), np.mean(errors[val])


  degrees = list(range(1, 9))
  train_errors, val_errors = [], []
  print("degree  training  validation")
  for degree in degrees:
      train_error, val_error = fit_and_score(degree)
      train_errors.append(train_error)
      val_errors.append(val_error)
      print(f"{degree:6}  {train_error:8.3f}  {val_error:10.3f}")

  plt.plot(degrees, train_errors, marker="o", label="training")
  plt.plot(degrees, val_errors, marker="o", label="validation")
  plt.yscale("log")
  plt.xlabel("highest power of absences")
  plt.ylabel("mean squared error")
  plt.legend()
  plt.show()
tasks:
  - id: lowest-validation
    prompt: "Run it. Which degree has the lowest validation error?"
    kind: answer
    accept: ["1", "degree 1"]
    feedback: "1: absences as a straight line, at 1.937. Every power added after that does worse on students the model hasn't met."
    wrong: "Read down the validation column for the smallest number."
  - id: training-trend
    prompt: "Read down the training column. Does the training error ever go up as the degree rises?"
    kind: answer
    accept: ["no", "never", "it never goes up", "no it doesn't"]
    feedback: "Never. A model with absences to the power 8 can do anything one with the power 7 can, and bend once more, so on its own students it can only do as well or better."
    wrong: "Compare each training number with the one above it."
  - id: degree-six
    prompt: "At degree 6, the training error is lower than at degree 1, and the validation error is over twelve thousand. Overfitting or underfitting?"
    kind: answer
    accept: ["overfitting", "overfit", "over", "over-fitting"]
    feedback: "Overfitting. The curve bent itself round the handful of students with huge absences in the training pile, and swings wildly wherever a validation student sits between them."
    wrong: "Is it doing too well on the students it learnt from, or too badly?"
---
Does the harm from absences run in a straight line, or curve? This program asks the data. It holds 90 students back for validation, fits the five-column model with absences up to each power from 1 to 8 on the other 267, and prints the training and validation errors. Then it plots the validation curve.

The chart's error axis is logarithmic: each mark up the side is ten times the one below. Without that, degree 6 would flatten everything else.
