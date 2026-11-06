---
id: learn-sort
type: learn
title: In order
concept: sorted-vs-sort
code: |
  tasks = ["order ink", "album cover", "frame the prints"]
  in_order = sorted(tasks)
  print(in_order)
  print(tasks)
  tasks.sort()
  print(tasks)
---
Python has two ways to put a list in order. `sorted(tasks)` makes a new list in order and leaves `tasks` alone. `tasks.sort()` rearranges `tasks` itself.

Use `sorted` when you need the old order as well, like an alphabetical copy for a whiteboard while Riya's list stays in the order people asked. Use `.sort()` when the old order doesn't matter.

Text sorts alphabetically. The example prints the sorted copy, then `tasks` as it was, then `tasks` after `.sort()`.

The usual slip is `tasks = tasks.sort()`. `.sort()` hands back nothing, which Python shows as `None`. So that line sorts the list, then moves the name `tasks` onto `None`, and the list is lost.
