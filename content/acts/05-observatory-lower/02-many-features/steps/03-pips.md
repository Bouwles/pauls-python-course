---
id: pips
type: pips
title: Pip's Version
files: [forecast.py]
entry: forecast.py
dialogue:
  - pip: "Frost forecast. Five readings, all scaled, trained in half a second."
  - pip: "It says tonight's low is nan degrees. Is that cold? It sounds cold."
dialogue_after:
  - pip: "So tonight borrows the old nights' ruler. It hasn't got one of its own."
hints:
  nudge: "What is the spread of a column with only one number in it?"
  plan:
    - Work out the means and spreads once, from the sixty nights
    - Scale the nights with them
    - Scale tonight with the same ones
  shape: |
    means = X.mean(axis=0)
    spreads = X.std(axis=0)


    def standardise(X):
        return (X - ___) / ___
---
Pip's forecast learns from Penhallow's sixty nights, then forecasts tonight's low from the readings in `TONIGHT`. Run it.

`nan` means not a number: it's what NumPy gives for nought divided by nought. Find where it comes from. Then fix the forecast so tonight is measured with the same ruler as the nights the weights were learnt from.

The checks try other evenings in `TONIGHT` as well.
