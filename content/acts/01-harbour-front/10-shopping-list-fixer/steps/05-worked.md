---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Mira's round has the same trouble. Repeats, and a street that's dug up."
code: |
  # Mira's round: streets in the order she walks them
  streets = ["Quay Row", "Mill Lane", "Quay Row", "Chapel Street", "Rope Walk", "Mill Lane"]
  closed = ["Rope Walk"]

  round_order = []
  for street in streets:
      if street not in round_order:
          round_order.append(street)

  for street in closed:
      if street in round_order:
          round_order.remove(street)

  by_name = sorted(round_order)
  before_lunch = round_order[:2]

  print("Sorting frame:")
  for street in by_name:
      print(street)
  print("Before lunch:")
  for street in before_lunch:
      print(street)
subgoals:
  - label: Remove the repeats, keeping the first of each
    lines: [5, 8]
  - label: Take out what doesn't apply
    lines: [10, 12]
  - label: Sort a copy, not the original
    lines: [14, 14]
  - label: Slice off the part you need
    lines: [15, 15]
  - label: Show each list, one item per line
    lines: [17, 22]
explain:
  prompt: "Why does line 14 use `sorted(round_order)` and not `round_order.sort()`?"
  answer: "`.sort()` would rearrange Mira's walking order, so line 15 would take the first two streets alphabetically, not the first two she walks. `sorted()` makes a new list and leaves hers alone."
  concept: sorted-vs-sort
---
Line 7 is the `in` from the pigeonholes, turned round: only add a street that isn't there yet.

Line 11 checks before removing. `.remove()` crashes with a ValueError if the item isn't on the list.
