---
id: worked
type: worked
title: How Moss would squash it
dialogue:
  - okonjo: "Five measurements for every customer. I sometimes suspect they are one measurement, five times."
  - moss: "Let's find out how many there really are."
code: |
  import numpy as np

  # Mr Okonjo's customers: chest, waist, hips, arm, neck (cm)
  customers = np.loadtxt("measurements.csv", delimiter=",", skiprows=1)[:, 1:]

  means = customers.mean(axis=0)
  centred = customers - means

  spread = centred.T @ centred / (len(customers) - 1)
  print("Same as np.cov:", np.allclose(spread, np.cov(customers, rowvar=False)))

  values, vectors = np.linalg.eigh(spread)
  order = np.argsort(values)[::-1]
  values, vectors = values[order], vectors[:, order]
  if vectors[:, 0].sum() < 0:
      vectors[:, 0] = -vectors[:, 0]    # the same line, pointing the other way

  print("Shares:", np.round(values / values.sum(), 3))
  print("First direction:", np.round(vectors[:, 0], 2))

  size = centred @ vectors[:, 0]
  print("Customer 1 is", round(size[0], 1), "along it")
subgoals:
  - label: Load the readings
    lines: [3, 4]
  - label: Centre each column
    lines: [6, 7]
  - label: The covariance matrix
    lines: [9, 10]
  - label: Its eigenvectors, biggest first
    lines: [12, 16]
  - label: How much each explains
    lines: [18, 19]
  - label: Squash onto the first direction
    lines: [21, 22]
explain:
  prompt: "Every number in the first direction is positive. What does a customer 20 along it look like?"
  answer: "Bigger than average everywhere at once: chest, waist, hips, arms and neck together, most of all chest and waist. The first direction is overall size, and it holds 95% of how Mr Okonjo's customers differ. Customer 1, at minus 27, is small all over."
  concept: pca
---
**Principal component analysis**, PCA, finds the directions readings spread along, biggest first. Centre each column, work out the covariance, and its eigenvectors are the directions: the **principal components**. Each eigenvalue's share of the total is how much of the spread that direction **explains**.

Squashing a customer onto a direction is a dot product: their centred readings times the direction's numbers, added up. `centred @ vectors[:, 0]` does every customer at once, and turns five measurements into one.

An eigenvector and its negative are the same line, and `eigh` may hand back either, so Moss turns the first one round if it points mostly backwards.
