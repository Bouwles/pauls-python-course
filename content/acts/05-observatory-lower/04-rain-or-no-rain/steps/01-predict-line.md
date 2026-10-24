---
id: predict-line
type: predict
title: A chance of 115 per cent
concept: logistic-regression
dialogue:
  - wendt: "Rain is 1, no rain is 0. Fit the line from the first job and call it a chance. Surely."
code: |
  import numpy as np

  # Eight evenings: humidity (%), and 1 if it rained before midnight
  humidity = np.array([62, 70, 75, 80, 84, 88, 93, 97])
  rained = np.array([0, 0, 0, 1, 0, 1, 1, 1])

  w, b = np.polyfit(humidity, rained, 1)
  for evening in [50, 100]:
      print(round(w * evening + b, 2))
question: "What does it say for an evening at 50% humidity, and one at 100%?"
options:
  - text: |-
      0.0
      1.0
    misconception: line-stays-in-range
    feedback: "Nothing holds a straight line between 0 and 1. It keeps going at the same slope past the last reading, so at 50% it's below nought and at 100% it's above one."
  - text: |-
      -0.57
      1.15
    correct: true
    feedback: "Right. A chance of minus 57 per cent, and one of 115. The line fits the eight evenings as well as a line can, and it has no idea that chances stop at 0 and 1."
  - text: "A TypeError: rain and no rain aren't measurements"
    misconception: zero-one-cannot-be-fitted
    error: TypeError
    feedback: "Written as 1 and 0, they're numbers like any other, and `polyfit` fits them without complaint. The trouble is what the line says, not whether it can be drawn."
after: |
  Run it. Then add these lines at the end and run it again:

  ```python
  scores = np.array([-4.0, -1.0, 0.0, 1.0, 4.0])
  print(np.round(1 / (1 + np.exp(-scores)), 2))
  ```

  That's the **sigmoid**. Any number goes in; a number between 0 and 1 comes out, and a score of 0 comes out as exactly 0.5.
---
Rain or no rain is a yes-or-no answer. A model for it should give a chance: a number from 0 to 1.

Here is the obvious try, on eight evenings from the notebook. It fits a straight line through the 0s and 1s and reads the line's answer as the chance of rain.
