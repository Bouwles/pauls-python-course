---
id: learn-tuple
type: learn
title: Numbers that stay together
concept: tuples
code: |
  hale = (112, 98, 84)
  print(hale)
  print(hale[2])
  print(len(hale))
---
A **tuple** is a group of values in round brackets: `(112, 98, 84)`. You read it like a list: `hale[2]` is the third value, and `len(hale)` counts them.

The difference is that a tuple can't be changed once it's made. That suits a record whose parts belong together, like one player's chest, waist and leg, in centimetres. Nothing can shift one number away from the others.

To change a tuple, build a new one: `hale = (110, hale[1], hale[2])`.

The example prints the tuple, `84`, then `3`.

The usual slip is to treat a tuple like a list and change one value in place, with `hale[0] = 110` or `.append()`. Python stops with a TypeError.
