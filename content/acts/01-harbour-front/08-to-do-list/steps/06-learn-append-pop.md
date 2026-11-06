---
id: learn-append-pop
type: learn
title: On the end, and off again
concept: append-pop
code: |
  tasks = ["rocket poster", "album cover"]
  tasks.append("order ink")
  print(tasks)
  finished = tasks.pop(0)
  print("Done:", finished)
  print(tasks)
---
`.append()` adds an item to a list, and `.pop()` takes one off. Like `.upper()` on a string, you write them after the name with a dot. Unlike string methods, they change the list itself.

A to-do list needs both: new jobs on the end, finished ones off.

`tasks.append(x)` puts `x` on the end. `tasks.pop(0)` takes off the item at index 0 and hands it back, so you can keep it in a variable or print it. The items after it move up to fill the gap. The example adds order ink, then takes off the rocket poster.

The usual slip is `tasks.pop()` with empty brackets. It takes off the last item, not the first.
