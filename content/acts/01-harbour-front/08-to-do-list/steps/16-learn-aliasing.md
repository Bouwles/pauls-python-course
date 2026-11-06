---
id: learn-aliasing
type: learn
title: Two names, one list
concept: list-aliasing
code: |
  tasks = ["rocket poster", "album cover"]
  board = tasks
  board.append("order ink")
  print(tasks)
  spare = tasks.copy()
  spare.append("frames")
  print(tasks)
  print(spare)
---
`board = tasks` doesn't make a second list. It puts a second name on the same list, so a change made through either name shows up in both.

It matters when you want a copy that changes on its own, like an alphabetical list for Riya's whiteboard that leaves her real order alone.

In the example, appending to `board` changes `tasks` too, because there's only one list. `tasks.copy()` makes a second, separate list, and so does `sorted(tasks)`. Appending to `spare` leaves `tasks` alone. The last line prints the four items in `spare`.

The usual slip is to think `=` copies a list. It never does. It only gives the same list another name.
