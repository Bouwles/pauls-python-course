---
id: predict-nearest
type: predict
title: Most like tonight
concept: knn
dialogue:
  - wendt: "Tonight is damp, still and very nearly at its dew point. Fog weather, if ever I saw it."
code: |
  import numpy as np

  # humidity (%), spread to the dew point (degrees), wind (knots), pressure (hPa)
  tonight = np.array([96, 0.5, 3, 1021])
  nights = np.array([
      [95, 0.6, 2, 998],     # night 1: fog
      [90, 2.5, 3, 1021],    # night 2: clear
      [97, 0.4, 4, 1000],    # night 3: fog
  ])

  distance = np.sqrt(((nights - tonight) ** 2).sum(axis=1))
  print("Most like tonight: night", np.argmin(distance) + 1)
question: "Which night does the distance say is most like tonight?"
options:
  - text: "Most like tonight: night 3"
    misconception: distance-treats-features-fairly
    feedback: "To us, night 3 matches on everything that makes fog. To the sum, pressure differences of 21 and 23 hPa square to over 400 each, and swamp a dew point spread that differs by tenths."
  - text: "Most like tonight: night 2"
    correct: true
    feedback: "Right. Night 2 has tonight's pressure exactly, and pressure is counted in hundreds of hPa. Its humidity is 6 out and its spread 2 degrees out, which is the difference between fog and a clear sky, but those barely register."
  - text: "A ValueError: the readings are in different units"
    misconception: numpy-checks-units
    error: ValueError
    feedback: "NumPy has no idea what a hectopascal is. Every column is just numbers to it, which is precisely the problem."
after: |
  Run it, then print `distance` to see the three. Now put each column on the same footing: divide `nights` and `tonight` by `np.array([5, 1, 3, 10])`, roughly each reading's spread, before measuring. Which night is nearest now?
---
**Nearest neighbours** forecasts by finding the past nights most like tonight. "Most like" means nearest: subtract one night's readings from the other's, square the differences, add them up and take the square root. That's the straight-line distance, as on a map, but with four readings instead of two.

Here are three nights from the notebook and tonight's readings.
