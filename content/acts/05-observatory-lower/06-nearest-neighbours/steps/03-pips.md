---
id: pips
type: pips
title: Pip's Version
files: [analogue.py, tools.py]
entry: analogue.py
dialogue:
  - pip: "Five nearest nights now, not one. I've grown."
  - pip: "It says clear. Every night. All sixty. Saltmarsh has never had sixty clear nights in a row."
dialogue_after:
  - pip: "Axis 0 adds down the columns. I was measuring the readings from each other, not the nights."
hints:
  nudge: "Print `distances(X_train, X_val[0]).shape`. How many nights are in `X_train`, and how many numbers came back?"
  plan:
    - Subtract the point from every row
    - Square the differences
    - Add them up along each row, one total per night
    - Take the square root
  shape: |
    def distances(X, point):
        """How far every row of X is from point."""
        return np.sqrt(((X - point) ** 2).sum(axis=___))
---
Pip forecasts each validation evening from its five nearest training nights. Run it, and read the first line.

`distances` should give one number for each night in `X`. Find out what it gives instead, and fix it. The rest of the program is sound.
