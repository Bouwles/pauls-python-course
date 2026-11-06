---
id: predict-loop
type: predict
title: Down the list
concept: looping-lists
code: |
  prints = ["Neil", "Caitlin", "Yahya"]
  for name in prints:
      print("Print for", name)
question: What does this print?
options:
  - text: |-
      Print for Neil
      Print for Caitlin
      Print for Yahya
    correct: true
    feedback: "One pass per item, from the start. Each pass, `name` holds the next name on the list."
  - text: |-
      Print for 0
      Print for 1
      Print for 2
    misconception: loop-gives-index
    feedback: "Looping over the list itself gives the items, not their indexes. For the indexes you'd loop over `range(len(prints))`."
  - text: "Print for ['Neil', 'Caitlin', 'Yahya']"
    misconception: loop-body-runs-once
    feedback: "The loop doesn't hand over the whole list in one go. It makes one pass for each item, so there are three lines."
---
Riya has three prints to hand out.
