---
id: learn-is
type: learn
title: The same, or the same one
concept: is-vs-equals
code: |
  monday = {"bread": 40}
  tuesday = {"bread": 40}
  sheet = monday
  print(monday == tuesday)
  print(monday is tuesday)
  print(monday is sheet)
---
`==` asks whether two things hold the same values. `is` asks whether they're the same object: one box with two labels on it.

When numbers change on their own, `is` is the question that finds out why. If two of Caitlin's sheets are the same box, a sale on one is a sale on both.

`monday` and `tuesday` hold the same numbers but are two dictionaries, so they're equal and not the same. `sheet` is a second label on Monday's. The example prints `True`, `False`, then `True`.

You've used `is` already, in `if team is None:`. There's only one `None`.

The usual slip is to think equal means the same object. A copy is equal to its original, but it isn't it.
