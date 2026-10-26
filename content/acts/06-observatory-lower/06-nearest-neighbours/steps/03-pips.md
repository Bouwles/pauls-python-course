---
id: pips
type: pips
title: Pip's Version
files: [identify.py, tools.py]
entry: identify.py
dialogue:
  - pip: "Five nearest penguins now, not one. I've grown."
  - pip: "It's never once said Chinstrap. Sixty-eight of them in the data. Shy birds, I expect."
dialogue_after:
  - pip: "Axis 0 adds down the columns. I was measuring the flippers from the weights, not the penguins from each other."
hints:
  nudge: "Print `distances(X_train, X_val[0]).shape`. How many penguins are in `X_train`, and how many numbers came back?"
  plan:
    - Subtract the point from every row
    - Square the differences
    - Add them up along each row, one total per penguin
    - Take the square root
  shape: |
    def distances(X, point):
        """How far every row of X is from point."""
        return np.sqrt(((X - point) ** 2).sum(axis=___))
---
Pip names each validation penguin from its five nearest training penguins, by flipper length and body mass. Run it, and read the first line.

`distances` should give one number for each penguin in `X`. Find out what it gives instead, and fix it. The rest of the program is sound.
