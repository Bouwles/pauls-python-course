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
    feedback: "`.sort()` does sort the list, but it hands back `None`. Line 2 then moves the name `tasks` onto that `None`."
  - text: "['order ink', 'answer Caitlin', 'frame the prints']"
    misconception: sort-makes-copy
    feedback: "`.sort()` changes the list itself; it doesn't make a sorted copy. And line 2 then moves the name `tasks` onto what `.sort()` handed back, which is `None`."
  - text: "None"
    correct: true
    feedback: "`.sort()` rearranges the list where it stands and hands back nothing, which Python shows as `None`. Line 2 moves the name `tasks` onto that. Writing `tasks.sort()` on its own line would have kept the sorted list."
---
Riya wants her jobs in alphabetical order. Read line 2 carefully.
