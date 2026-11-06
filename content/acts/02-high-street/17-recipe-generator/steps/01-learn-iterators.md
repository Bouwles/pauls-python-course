---
id: learn-iterators
type: learn
title: One at a time
concept: iterators
code: |
  laps = iter([62.4, 59.8, 61.0])
  print(next(laps))
  print(next(laps))
  for lap in laps:
      print("left:", lap)
---
An **iterator** hands over its values one at a time, and remembers where it's got to. `iter(a_list)` makes one from a list, and `next(laps)` asks it for the next value.

Neil's race log is far too long to hold at once, and a line at a time is enough.

A `for` loop asks an iterator for its next value, over and over, until there's nothing left. An open file is an iterator too: each value is the next line. The example prints `62.4` and `59.8`, then the loop carries on from there: `left: 61.0`.

With nothing left, `next` stops with a `StopIteration` error. Add one more `print(next(laps))` to see it.

The usual slip is to expect an iterator to start again. It only goes forward.
