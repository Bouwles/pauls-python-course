---
id: learn-slicing
type: learn
title: A run of items
concept: slicing
code: |
  tasks = ["rocket poster", "album cover", "order ink", "frame the prints"]
  print(tasks[1:3])
  print(tasks[:2])
  print(tasks)
---
A **slice** takes a run of items from a list. `tasks[start:stop]` gives a new list, from index `start` up to, but not including, `stop`.

It's how you take the first three jobs, or the last two, in one go.

Leave out `start` and the slice begins at the front. Leave out `stop` and it runs to the end. The example prints `['album cover', 'order ink']`, then the first two, then the whole list, unchanged: a slice is a new list, and the old one stays as it was. Strings slice the same way.

The usual slip is to expect the item at `stop` to be included. `tasks[1:3]` is indexes 1 and 2 only.
