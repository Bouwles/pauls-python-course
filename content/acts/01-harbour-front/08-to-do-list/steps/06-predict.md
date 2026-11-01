---
id: predict-sort
type: predict
title: Sorted, or sort
concept: sorted-vs-sort
code: |
  tasks = ["order ink", "answer Caitlin", "frame the prints"]
  tasks = tasks.sort()
  print(tasks)
question: What does this print?
options:
  - text: "['answer Caitlin', 'frame the prints', 'order ink']"
    misconception: sort-returns-list
    feedback: "`.sort()` does sort the list, but it hands back `None`. Line 2 then moves the label `tasks` onto that `None`."
  - text: "['order ink', 'answer Caitlin', 'frame the prints']"
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
