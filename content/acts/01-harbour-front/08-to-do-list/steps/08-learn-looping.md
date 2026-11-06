---
id: learn-looping
type: learn
title: One pass per item
concept: looping-lists
code: |
  tasks = ["rocket poster", "album cover", "order ink"]
  for task in tasks:
      print("To do:", task)
  for spot in range(len(tasks)):
      print(f"{spot + 1}. {tasks[spot]}")
---
A `for` loop can go through a list: `for task in tasks:` makes one pass per item, and puts the next item in `task` each time.

That's how you print a list of any length, one line per job, without knowing how many jobs there are.

When you need the position too, loop over `range(len(tasks))`. That gives every index the list has, 0, 1 and 2, and `tasks[spot]` is the item at each one. Riya's numbers start at 1, so the example prints `spot + 1`: `1. rocket poster`, `2. album cover`, `3. order ink`.

The usual slip is to expect `for task in tasks:` to give the indexes 0, 1, 2. It gives the items themselves.
