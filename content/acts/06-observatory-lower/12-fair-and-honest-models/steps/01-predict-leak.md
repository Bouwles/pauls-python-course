---
id: predict-leak
type: predict
title: The morning after
concept: data-leakage
dialogue:
  - wendt: "Penhallow's dome log has a column I'd never noticed. How long the dome was open each night."
  - pip: "That must help. Open long, good night. Obviously."
code: |
  import numpy as np
  from sklearn.model_selection import cross_val_score
  from sklearn.tree import DecisionTreeClassifier

  rng = np.random.default_rng(3)
  cloud = rng.integers(0, 9, 200)
  usable = (cloud + rng.normal(0, 1.5, 200) < 4).astype(int)
  dome_hours = usable * rng.uniform(2, 8, 200)   # filled in the morning after

  X = np.column_stack([cloud, dome_hours])
  model = DecisionTreeClassifier(max_depth=3, random_state=0)
  print(round(cross_val_score(model, X, usable, cv=5).mean(), 2))

  model.fit(X, usable)
  tonight = [[0, 0.0]]    # not a cloud in the sky, and the dome isn't open yet
  print(model.predict(tonight))
question: "What does this print: the cross-validated accuracy, then tonight's forecast?"
options:
  - text: |-
      1.0
      [1]
    misconception: leak-still-forecasts
    feedback: "A perfect score, yes. But the model learnt that the dome was open on every usable night and shut on every other, and tonight, before anyone has opened it, the dome hours are 0. So it says no, under a cloudless sky."
  - text: |-
      1.0
      [0]
    correct: true
    feedback: "Right. A perfect score, and useless. `dome_hours` is only written down after the night has turned out well, so it knows the answer. Tonight it's 0, as it is every evening before the dome opens, and the model says no to a clear sky."
  - text: |-
      0.8
      [1]
    misconception: cross-validation-catches-leaks
    feedback: "Cross-validation can't tell a leak from skill. The leaky column is in every fold, training and scoring alike, so every fold scores perfectly. Only asking when each column is known catches it."
after: |
  Run it. Then take `dome_hours` out of `X` and run it again: lower, and honest. Try `tonight = [[7, 0.0]]` with it back in, too.
---
**Data leakage** is when something in the training data gives away the answer in a way that won't be there when the model is used for real. The commonest kind is a column filled in after the event.
