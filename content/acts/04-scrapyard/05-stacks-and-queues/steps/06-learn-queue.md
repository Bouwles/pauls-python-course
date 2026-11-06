---
id: learn-queue
type: learn
title: First come, first served
concept: queues
code: |
  printer = []
  printer.append("essay")
  printer.append("poster")
  printer.append("timetable")
  print(printer.pop(0))
  print(printer.pop(0))
  print(printer)
---
A **queue** is used from both ends: things join at the back and leave from the front. The first in is the first out, like the jobs waiting at the class printer.

Your editor will need one. Paul types several commands on one line, and they must run in the order he typed them.

A list can do it: `append` joins the back, and `pop(0)` takes from position 0, the front. The example prints `essay`, `poster`, then `['timetable']`.

The usual slip is with speed. `pop(0)` shuffles every item behind it up one place, a hidden loop, so serving each job is O(n). On a long queue, that adds up.
