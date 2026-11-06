---
id: learn-enumerate
type: learn
title: Numbering as you go
concept: enumerate
code: |
  names = ["Jon Hale", "Mae Grant", "Ray Lowe"]
  for number, name in enumerate(names, start=1):
      print(f"{number}. {name}")
---
`enumerate(names)` hands over each item with a number in front, as a pair: `(number, item)`. A loop unpacks them, `for number, name in enumerate(names):`, so you never keep a counter by hand.

Caitlin's book numbers every line.

It counts from 0, like positions in a list, unless you say where to start: `enumerate(names, start=1)`. The example prints `1. Jon Hale`, `2. Mae Grant`, then `3. Ray Lowe`.

The number always comes first in each pair, whatever you call the variables.

The usual slip is to leave out `start=1` and get a book that begins at 0.
