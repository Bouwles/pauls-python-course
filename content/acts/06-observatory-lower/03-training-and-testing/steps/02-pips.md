---
id: pips
type: pips
title: Pip's Version
files: [predictor.py]
entry: predictor.py
dialogue:
  - pip: "Exam predictor. Five columns, all scaled, trained in half a second."
  - pip: "It says the new student will get nan out of twenty. Is that good? It sounds foreign."
dialogue_after:
  - pip: "So the new student borrows everyone else's ruler. One student hasn't got a spread of their own."
hints:
  nudge: "What is the spread of a column with only one number in it?"
  plan:
    - Work out the means and spreads once, from the students the model learns from
    - Scale those students with them
    - Scale the new student with the same ones
  shape: |
    means = X.mean(axis=0)
    spreads = X.std(axis=0)


    def standardise(X):
        return (X - ___) / ___
---
Pip's predictor learns from all 357 students, then predicts the final grade of the student in `NEW_STUDENT`: 12 after the first term, a couple of hours' study a week, no past failures, going out a fair amount, four absences. Run it.

`nan` means not a number: it's what NumPy gives for nought divided by nought. Find where it comes from. Then fix the predictor so the new student is measured with the same ruler as the students the weights were learnt from.

The checks try other students in `NEW_STUDENT` as well.
