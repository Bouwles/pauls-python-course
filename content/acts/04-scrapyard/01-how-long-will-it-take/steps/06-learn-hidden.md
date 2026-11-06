---
id: learn-hidden
type: learn
title: Loops you can't see
concept: big-o
code: |
  parts = ["axle", "bolt", "chain", "disc", "nut"]

  # What "nut" in parts does, written out
  looks = 0
  for part in parts:
      looks = looks + 1
      if part == "nut":
          break

  print("nut" in parts, looks)
---
`"nut" in parts` looks like one step. When `parts` is a list, it isn't. Python checks the list one item at a time from the front, until it finds a match or runs out: a loop, hidden in one word. `.count()`, `.index()` and `.remove()` on a list hide one too.

The example writes that hidden loop out. `nut` is last, so it takes five looks, and it prints `True 5`.

So a `for` over n parts with `in` on a list inside it is n looks for each of n parts: O(n²), with one loop in sight. A set goes straight to where an item would be kept, in one step, as in the Lost Property Matcher.

The usual slip is to count only the loops you can see.
