---
id: predict-memorise
type: predict
title: By heart
concept: overfitting
dialogue:
  - yahya.neutral: "The heating goes off at six. I logged the radiator every quarter of an hour, two evenings running."
  - yahya.proud.point: "Degrees above the room. My curve goes through every one of Tuesday's readings."
code: |
  import numpy as np

  tuesday_hours = np.arange(12) * 0.25
  tuesday = np.array([6.57, 4.63, 3.43, 2.40, 1.78, 2.35, 1.33, 1.07, 1.09, 0.78, 0.34, 0.25])
  wednesday_hours = tuesday_hours + 0.05
  wednesday = np.array([6.07, 4.30, 3.66, 2.45, 1.74, 1.49, 1.00, 0.98, 0.23, 0.54, 0.96, 0.39])


  def polynomial_features(x, degree):
      return np.column_stack([x ** power for power in range(degree + 1)])


  errors = {}
  for degree in [1, 11]:
      weights = np.linalg.lstsq(polynomial_features(tuesday_hours, degree), tuesday, rcond=None)[0]
      tuesday_error = np.mean((polynomial_features(tuesday_hours, degree) @ weights - tuesday) ** 2)
      wednesday_error = np.mean((polynomial_features(wednesday_hours, degree) @ weights - wednesday) ** 2)
      errors[degree] = (tuesday_error, wednesday_error)

  print("Best on Tuesday: degree", 1 if errors[1][0] < errors[11][0] else 11)
  print("Best on Wednesday: degree", 1 if errors[1][1] < errors[11][1] else 11)
question: What does this print?
options:
  - text: |-
      Best on Tuesday: degree 11
      Best on Wednesday: degree 11
    misconception: training-error-measures-skill
    feedback: "Degree 11 has twelve weights for Tuesday's twelve readings, so it goes through every one exactly. Between and beyond them it swings wildly, and every one of Wednesday's readings is between or beyond. Its Wednesday error is about 34; the straight line's is about 0.6."
  - text: |-
      Best on Tuesday: degree 11
      Best on Wednesday: degree 1
    correct: true
    feedback: "Right. Degree 11 learnt Tuesday by heart: twelve weights, twelve readings, an error of 0. Three minutes along, on Wednesday, it is wrong by miles."
  - text: |-
      Best on Tuesday: degree 1
      Best on Wednesday: degree 1
    misconception: straight-line-fits-best
    feedback: "On the readings it was fitted to, the more flexible curve always does at least as well: degree 11 could be a straight line if that were best, and it can bend too. It goes through all twelve readings exactly."
after: |
  Run it. Then print `errors[1][1]` and `errors[11][1]`, the two Wednesday errors.
---
The radiator cools in a curve, and a straight line can't follow it. Linear regression can, though, if you give it more columns: `x ** 0` (all ones, for `b`), `x`, `x ** 2`, `x ** 3` and so on, each with a weight of its own. These are **polynomial features**, and the highest power is the **degree**. It's still least squares, on a wider table.

Yahya took Tuesday's twelve readings every quarter of an hour. Wednesday's came at the same pace, three minutes later. Both curves learn from Tuesday only, then try Wednesday.

Predict which does better on each evening.
