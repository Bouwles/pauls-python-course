---
id: predict-deque
type: predict
title: The queue at the printer
concept: deque
code: |
  from collections import deque

  printer = deque(["essay", "poster"])
  printer.append("timetable")
  first = printer.popleft()
  printer.appendleft("ticket")
  print(first)
  print(list(printer))
question: What does this print?
options:
  - text: |-
      essay
      ['ticket', 'poster', 'timetable']
    correct: true
    feedback: "Right. The timetable joins the back, the essay leaves from the front, and the ticket is put in at the front, ahead of the poster."
  - text: |-
      timetable
      ['ticket', 'essay', 'poster']
    misconception: queue-serves-newest
    feedback: "`popleft` takes from the left, the front, where the job that has waited longest is. The timetable only just arrived, at the back."
  - text: |-
      essay
      ['poster', 'timetable', 'ticket']
    misconception: appendleft-joins-back
    feedback: "`appendleft` adds on the left, which is the front of the queue. `append` is the one that joins the back."
---
A **queue** is used from both ends: join at the back, leave from the front. First come, first served, as at the Studio's printer.

A list can do it with `pop(0)`, but each time the front job leaves, every job behind it is shuffled up a place: O(n) for every one served.

`collections.deque` (say "deck") is built for both ends. `append` and `pop` work at the right, `appendleft` and `popleft` at the left, and all four are O(1).
