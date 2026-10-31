---
id: predict-sort
type: predict
title: Sorted, or sort
concept: sorted-vs-sort
code: |
  tasks = ["wipe the board", "answer Caitlin", "fix the projector"]
  tasks = tasks.sort()
  print(tasks)
question: What does this print?
options:
  - text: "['answer Caitlin', 'fix the projector', 'wipe the board']"
    misconception: sort-returns-list
    feedback: "`.sort()` does sort the list, but it hands back `None`. Line 2 then moves the label `tasks` onto that `None`."
  - text: "['wipe the board', 'answer Caitlin', 'fix the projector']"
    misconception: sort-makes-copy
    feedback: "`.sort()` changes the list itself; it doesn't make a sorted copy. But line 2 then moves the label onto what `.sort()` handed back."
  - text: "None"
    correct: true
    feedback: "Right. `.sort()` rearranges the list where it stands and hands back nothing, which Python shows as `None`. The label now points at that."
after: |
  Run it. Then change line 2 to `tasks = sorted(tasks)` and run it again.
---
Python has two ways to sort. `sorted(tasks)` makes a new list in order. `tasks.sort()` puts `tasks` itself in order.

Only one of them hands anything back.
