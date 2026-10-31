---
id: pips
type: pips
title: Fix Riya's version
files: [predictor.py]
entry: predictor.py
dialogue:
  - riya: "Can you look at mine? Exam predictor. Five columns, all scaled, trained in half a second."
  - riya: "It's fine on all 357 students. Then the new student gets nan out of twenty. Something's off."
dialogue_after:
  - riya: "So the new student borrows everyone else's ruler. One student hasn't got a spread of their own."
  - riya: "I only ever tried it on the table it learnt from. Who's actually going to use it? New students."
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
Riya's predictor learns from all 357 students, then predicts the final grade of the student in `NEW_STUDENT`: 12 after the first term, a couple of hours' study a week, no past failures, going out a fair amount, four absences. Run it.

`nan` means not a number: it's what NumPy gives for nought divided by nought. Find where it comes from. Then fix the predictor so the new student is measured with the same ruler as the students the weights were learnt from.

The checks try other students in `NEW_STUDENT` as well.
