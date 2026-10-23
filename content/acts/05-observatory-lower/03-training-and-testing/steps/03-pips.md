---
id: pips
type: pips
title: Pip's Version
files: [curve.py]
entry: curve.py
dialogue:
  - pip: "Degree eleven. Error on Tuesday: nought. Not small. Nought."
  - pip: "Professor Wendt ran it on Wednesday's readings and went very quiet."
dialogue_after:
  - pip: "It learnt Tuesday by heart. Not the mirror. Just Tuesday."
  - pip: "I'm going to sit on the roof for a bit."
  - moss: "Leave him. He'll be down when it rains."
hints:
  nudge: "Which readings does `choose_degree` score each curve on? Which readings is it given and never uses?"
  plan:
    - Fit each degree on the training readings
    - Score it on the validation readings
    - Give back the degree with the lowest validation error
  shape: |
    for degree in degrees:
        weights = fit_polynomial(x_train, y_train, degree)
        errors.append(mse(polynomial_features(___, degree) @ weights, ___))
    return degrees[int(np.argmin(errors))]
---
Pip fits every degree from 1 to 11 on Tuesday's readings, and keeps Wednesday's to choose with. Run it and read the last line.

Fix `choose_degree` so it does what its docstring says. It should still learn from Tuesday alone.
