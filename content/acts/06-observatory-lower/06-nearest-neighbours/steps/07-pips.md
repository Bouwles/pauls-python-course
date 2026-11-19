---
id: pips
type: pips
title: Fix Yahya's version
files: [identify.py, tools.py]
entry: identify.py
dialogue:
  - yahya.proud: "Can you look at mine? It's five nearest penguins with every distance in one line, and no loops at all."
  - yahya.confused: "It's never once said Chinstrap, though, and there are sixty-eight of them in the data."
dialogue_after:
  - yahya.surprised: "Axis 0 adds down the columns. I was measuring the flippers from the weights instead of the penguins from each other."
  - yahya.pleased.thumbs: "It's still one line, it's just the right one now."
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
Yahya's program names each validation penguin from its five nearest training penguins, by flipper length and body mass. Run it, and read the first line.

`distances` should give one number for each penguin in `X`. Find out what it gives instead, and fix it. The rest of the program is sound.
