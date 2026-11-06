---
id: learn-remove
type: learn
title: Take that one off
concept: list-methods
code: |
  tasks = ["rocket poster", "order ink", "album cover"]
  tasks.remove("order ink")
  print(tasks)
---
`.remove(x)` takes the item `x` off a list. You give it the value itself, not its index.

It's for when you know what's done but not where it sits on the list.

The example takes `order ink` off and prints `['rocket poster', 'album cover']`. If the value is on the list twice, only the first one goes, and the search stops there. If it isn't on the list at all, Python stops with a ValueError. Try `tasks.remove("brushes")` on line 2.

The usual slip is mixing it up with `.pop()`. `tasks.pop(1)` takes off whatever is at index 1. `tasks.remove("order ink")` looks for that text.
