---
id: learn-join
type: learn
title: Gluing pieces together
concept: split-join
code: |
  parts = ["Aaesha", "01632 960733", "The Engine Room"]
  print(" / ".join(parts))
  names = ["Print Shop", "Frame Shop"]
  print("Try: " + ", ".join(names))
---
`.join()` does the opposite of `.split()`. It glues a list of strings into one string, with a separator between each pair.

Riya's search will find a list of names, and she wants them on one line: `Try: Print Shop, Frame Shop`.

Write the separator first, then `.join()` with the list in the brackets: `", ".join(names)`. The example prints `Aaesha / 01632 960733 / The Engine Room`, then `Try: Print Shop, Frame Shop`.

The usual slip is to write it the way round you'd say it, `names.join(", ")`. Python stops with an error, because a list has no `join`. It belongs to the separator.
