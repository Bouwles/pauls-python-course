---
id: predict-sort
type: predict
title: Sorted, or sort
concept: sorted-vs-sort
code: |
  shopping = ["yeast", "butter", "flour"]
  shopping = shopping.sort()
  print(shopping)
question: What does this print?
options:
  - text: "['butter', 'flour', 'yeast']"
    misconception: sort-returns-list
    feedback: "`.sort()` does sort the list, but it hands back `None`. Line 2 then moves the label `shopping` onto that `None`."
  - text: "['yeast', 'butter', 'flour']"
    misconception: sort-makes-copy
    feedback: "`.sort()` changes the list itself; it doesn't make a sorted copy. But line 2 then moves the label onto what `.sort()` handed back."
  - text: "None"
    correct: true
    feedback: "Right. `.sort()` rearranges the list where it stands and hands back nothing, which Python shows as `None`. The label now points at that."
after: |
  Run it. Then change line 2 to `shopping = sorted(shopping)` and run it again.
---
Python has two ways to sort. `sorted(shopping)` makes a new list in order. `shopping.sort()` puts `shopping` itself in order.

Only one of them hands anything back.
