---
id: learn-lazy
type: learn
title: Only what's asked for
concept: lazy-evaluation
code: |
  def corrected(raw):
      for value in raw:
          print("working out", value)
          yield value - 50


  def first_two(values):
      found = []
      for value in values:
          found.append(value)
          if len(found) == 2:
              break
      return found


  print(first_two(corrected([210, 340, 400, 520])))
---
**Lazy evaluation** means nothing is worked out until something asks for it. Generators are lazy.

Chain them, each one looping over the one before, and each asks the one before for one item at a time. When the last one stops asking, everything stops, and the rest is never read. That's how Neil's search can stop at hour eight of a race years long.

In the example, `first_two` stops after two values, so 400 and 520 are never worked out. It prints `working out 210`, `working out 340`, then `[160, 290]`.

The usual slip is to use a generator twice. Once a loop has had every value, it's empty, and it says nothing. To use the values twice, keep them: `list(corrected(...))`.
