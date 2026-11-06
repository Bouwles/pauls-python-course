---
id: learn-edge-cases
type: learn
title: Where the bugs live
concept: edge-cases
code: |
  def slices_each(slices, people):
      return slices // people


  print(slices_each(12, 4))
  print(slices_each(12, 5))
  print(slices_each(3, 4))
---
An **edge case** is an input at the boundary of what code handles: zero, empty, exactly one, exactly on a limit.

Typical inputs rarely find bugs, because they're the ones the programmer thought about. Edges are where nobody looked. For the festival fund, the edges are taking out exactly everything, paying in nothing, and an account with nothing in it.

Wrong answers at the edges usually don't crash. The example prints `3`, `2`, then `0`: three slices for four people gives everyone nothing, and Python doesn't mind. Change the last line to `slices_each(3, 0)` and it does crash.

The usual slip is to test only a few ordinary amounts and call it done. Test the edges on purpose.
