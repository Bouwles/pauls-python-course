---
id: learn-set-operations
type: learn
title: Comparing two sets
concept: set-operations
code: |
  found = {"umbrella", "glove", "scarf"}
  reported = {"glove", "kite"}
  print(sorted(found - reported))
  print(sorted(reported - found))
  print(sorted(found | reported))
---
Two sets can be compared in one step, with no loop.

- `found & reported` keeps what's in both: handed in, and asked about.
- `found - reported` keeps what's in `found` and not in `reported`.
- `found | reported` keeps everything from either.

That's three of Caitlin's four lines, each in a few characters.

Subtraction is the one where order matters, as it does with numbers. `found - reported` is what nobody has asked about. `reported - found` is what hasn't turned up. The example prints `['scarf', 'umbrella']`, then `['kite']`, then all four things.

The usual slip is to read `&` as "and also", and expect everything from both sets. That's `|`. `&` keeps only what they share.
