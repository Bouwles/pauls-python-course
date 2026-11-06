---
id: learn-zip
type: learn
title: Two lists side by side
concept: zip
code: |
  names = ["Jon Hale", "Mae Grant"]
  legs = [84, 74]
  for name, leg in zip(names, legs):
      print(name, leg)
---
`zip(names, legs)` walks two lists side by side. Each time round a loop it hands over a pair: a tuple of one item from each list, the first of each, then the second of each.

It keeps two lists in step without counting positions. Caitlin's names and sizes are two lists in the same order.

Unpack each pair as it arrives: `for name, leg in zip(names, legs):`. The example prints `Jon Hale 84`, then `Mae Grant 74`.

The usual slip is to expect an error when one list is shorter. `zip` stops quietly at the end of the shorter one and leaves the extras out, so check your lists are the same length.
