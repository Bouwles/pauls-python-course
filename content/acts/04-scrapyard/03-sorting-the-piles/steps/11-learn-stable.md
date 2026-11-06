---
id: learn-stable
type: learn
title: Ties keep their order
concept: sort-stability
code: |
  laps = [("Neil", 3), ("Caitlin", 3), ("Riya", 1)]
  fastest_first = sorted(laps, key=lambda lap: lap[1])
  for driver, tenths in fastest_first:
      print(driver, tenths)
---
A sort is **stable** if items that tie keep the order they came in. Two laps at exactly three tenths stay in the order they were set, as in qualifying: whoever set it first goes ahead.

It matters when you sort by part of something. Each lap here is a pair, `(driver, tenths)`, and the `key` sorts by the tenths alone. Python's `sorted` is stable.

The example prints `Riya 1`, `Neil 3`, `Caitlin 3`. Neil set his lap first, so he stays ahead, though C comes before N.

A merge sort is stable if, on a tie, it takes from the left pile, as the `<=` in the merge does. The usual slip is to expect ties sorted by the rest of the item. Only the key counts.
