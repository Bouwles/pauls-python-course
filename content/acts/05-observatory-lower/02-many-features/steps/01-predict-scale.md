---
id: predict-scale
type: predict
title: One more clue
concept: feature-scaling
dialogue:
  - wendt: "Five readings an evening. Five clues must beat one. Surely."
code: |
  import numpy as np

  # Four evenings: temperature (degrees) and air pressure (hPa)
  evenings = np.array([[9.0, 1021.0], [12.5, 1004.0], [6.0, 1030.0], [11.0, 1012.0]])
  lows = np.array([2.1, 8.0, -0.5, 5.2])

  for columns, label in [([0], "temperature"), ([0, 1], "temperature and pressure")]:
      X = evenings[:, columns]
      w = np.zeros(len(columns))
      b = 0.0
      losses = []
      for step in range(200):
          miss = X @ w + b - lows
          losses.append(np.mean(miss ** 2))
          w = w - 0.005 * 2 * X.T @ miss / len(lows)
          b = b - 0.005 * 2 * np.mean(miss)
      if losses[-1] < losses[0]:
          print(label + ": settled")
      else:
          print(label + ": blew up")
question: What does this print?
options:
  - text: |-
      temperature: settled
      temperature and pressure: settled
    misconception: feature-scale-irrelevant
    feedback: "Pressure is around 1,000, temperature around 10. Squared, that makes the loss about ten thousand times steeper in the pressure weight's direction, so a step that suits temperature throws the pressure weight right across the valley and further up the other side, every time."
  - text: |-
      temperature: settled
      temperature and pressure: blew up
    correct: true
    feedback: "Right. Same walk, same rate, one extra column, and the loss ends as nan: not a number. Pressure's readings are a hundred times bigger than temperature's, so its slope is enormous, and 0.005 times an enormous slope is an enormous step."
  - text: "A ValueError, because the columns are in different units"
    misconception: numpy-checks-units
    error: ValueError
    feedback: "NumPy knows nothing about units. To it, 1021 hectopascals is just a number a hundred times bigger than 9 degrees, and that is exactly the trouble."
after: |
  Run it: NumPy warns about an overflow, then carries on regardless. Now change both 0.005s to 0.0000001 and print `w` at the end. Nothing blows up, but the temperature weight has barely left 0.
---
With several readings, `X` is a table: one row per evening, one column per reading. `w` holds one weight per column, and `X @ w` gives one prediction per row, each row's readings times their weights, added up. `X.T @ miss` gives every weight's slope at once. Otherwise it's the walk from the last job.

Here it is on four evenings: first with the temperature alone, then with the air pressure too.
