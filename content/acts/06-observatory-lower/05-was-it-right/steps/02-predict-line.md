---
id: predict-line
type: predict
title: A chance of 214 per cent
concept: logistic-regression
dialogue:
  - caitlin.pleased: "Diabetes is 1, none is 0. Fit the line from the house prices and call it a chance. Surely."
code: |
  import numpy as np

  # Eight respondents: body mass index, and 1 for diabetes or prediabetes
  bmi = np.array([21, 24, 26, 28, 31, 34, 38, 42])
  diabetes = np.array([0, 0, 0, 1, 0, 1, 1, 1])

  w, b = np.polyfit(bmi, diabetes, 1)
  for respondent in [15, 60]:
      print(round(w * respondent + b, 2))
question: "What does it say for a respondent with a BMI of 15, and one with a BMI of 60?"
options:
  - text: |-
      0.0
      1.0
    misconception: line-stays-in-range
    feedback: "Nothing holds a straight line between 0 and 1. It keeps going at the same slope past the last respondent, so at 15 it's below nought and at 60 it's far above one."
  - text: |-
      -0.36
      2.14
    correct: true
    feedback: "Right. A chance of minus 36 per cent, and one of 214. The line fits the eight respondents as well as a line can, and it has no idea that chances stop at 0 and 1."
  - text: "A TypeError: diabetes and none aren't measurements"
    misconception: zero-one-cannot-be-fitted
    error: TypeError
    feedback: "Written as 1 and 0, they're numbers like any other, and `polyfit` fits them without complaint. The trouble is what the line says, not whether it can be drawn."
after: |
  Run it. Then change the list to `[25, 35]`, inside the respondents' range, and run it again.
---
Here is the straight line from the house prices, fitted through eight respondents' 0s and 1s. `np.polyfit(x, y, 1)` gives the best line's `w` and `b`, as your formula did. The line's answer is read as the chance of diabetes.

The respondents' BMIs, their body mass index, run from 21 to 42.
