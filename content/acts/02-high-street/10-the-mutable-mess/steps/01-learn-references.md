---
id: learn-references
type: learn
title: Labels on boxes
concept: references
dialogue:
  - paul.neutral.think: "Remember the labels and the boxes from Riya's to-do list. Dictionaries work the same way."
code: |
  standing = {"bread": 3, "buns": 4}
  this_week = standing
  this_week["buns"] = 6
  print(standing)
  print(this_week)
---
A variable doesn't hold a dictionary or a list. It's a label stuck on one, which Python calls a **reference**. `this_week = standing` sticks a second label on the same box. It doesn't build a second box.

That's how numbers change on Caitlin's sheets when nobody touched them: two names, one dictionary, and a change made through either name shows through both.

Passing a dictionary to a function hands over one more label on the same box, so a function can change the caller's dictionary too.

The example prints `{'bread': 3, 'buns': 6}` twice. There is only one dictionary.

The usual slip is to think `=` makes a copy. It never does.
