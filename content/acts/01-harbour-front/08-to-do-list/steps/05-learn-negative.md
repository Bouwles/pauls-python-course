---
id: learn-negative
type: learn
title: Counting from the end
concept: negative-indices
code: |
  tasks = ["rocket poster", "album cover", "order ink"]
  print(tasks[-1])
  print(tasks[-2])
---
A **negative index** counts back from the end of a list. `tasks[-1]` is the last item and `tasks[-2]` the one before it.

It's how you reach the newest job without knowing how long the list is. `-1` is the last item whether the list holds 3 or 300. A string works the same way.

The example prints `order ink`, then `album cover`.

The usual slip is to look for the last item at `-0`. But `-0` is just `0`, the first item, so counting from the end starts at `-1`.
