---
id: pips
type: pips
title: Fix Riya's version
files: [predictor.py]
entry: predictor.py
dialogue:
  - riya.pleased: "Can you look at my exam predictor? It's got five columns, all scaled, and it trained in half a second."
  - riya.confused: "It's fine on all 357 students, but then the new one gets nan out of twenty and I don't get why."
dialogue_after:
  - riya.surprised: "Oh, the new student has to borrow everyone else's ruler, because one student on their own hasn't got a spread."
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

`nan` means "not a number": it's what NumPy gives for nought divided by nought. Find where it comes from, then fix the predictor so the new student is scaled with the same means and spreads as the students the weights were learnt from.

The checks try other students in `NEW_STUDENT` as well.
