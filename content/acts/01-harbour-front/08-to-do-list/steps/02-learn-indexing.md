---
id: learn-indexing
type: learn
title: Counting from nought
concept: indexing
code: |
  tasks = ["rocket poster", "album cover", "order ink"]
  print(tasks[0])
  print(tasks[2])
---
Each item in a list has an **index**: its position, counted from 0. Square brackets after the list's name pick out one item by its index.

That's how Riya's program will say which job is done: by its place in the list.

`tasks[0]` is the first item, the rocket poster. `tasks[2]` is the third, order ink. A string counts its letters the same way.

The usual slip is to count from 1. The first item is no steps from the start, so it's index 0, and in a list of 3 the last index is 2. Change line 3 to `print(tasks[3])` and run it: there's nothing at index 3, so Python stops with an IndexError.
