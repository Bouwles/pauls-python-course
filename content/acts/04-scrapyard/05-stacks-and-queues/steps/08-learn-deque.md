---
id: learn-deque
type: learn
title: A list built for both ends
concept: deque
code: |
  from collections import deque

  printer = deque(["essay", "poster"])
  printer.append("timetable")
  print(printer.popleft())
  print(list(printer))

  latest = deque(maxlen=2)
  for edit in ["a", "b", "c"]:
      latest.append(edit)
  print(list(latest))
---
`deque` (say "deck"), from the `collections` module, is a list built for both ends. `append` and `pop` work at the right, `appendleft` and `popleft` at the left, and all four are O(1): nothing shuffles up.

So a `deque` is the queue to use: `append` to join the back, `popleft` to leave from the front. The first half of the example prints `essay`, then `['poster', 'timetable']`.

Give one a `maxlen` and it keeps only that many. When it's full, adding at one end drops an item off the other. Your editor's undo stack is `deque(maxlen=20)`, so only the latest twenty edits are kept. The second half prints `['b', 'c']`.

The usual slip is to mix up the ends: `appendleft` adds at the front.
