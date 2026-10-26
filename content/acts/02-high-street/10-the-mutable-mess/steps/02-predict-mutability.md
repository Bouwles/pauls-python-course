---
id: predict-mutability
type: predict
title: Numbers and trays
concept: mutability
code: |
  loaves = 40
  count = loaves
  count = count - 5
  print(loaves)

  tray = [40]
  same_tray = tray
  same_tray[0] = same_tray[0] - 5
  print(tray[0])
question: What does this print?
options:
  - text: |-
      40
      35
    correct: true
    feedback: "Right. `count - 5` makes a new number and moves the `count` label to it; `loaves` stays on 40. `same_tray[0] = ...` changes what's inside the one list both labels share."
  - text: |-
      35
      35
    misconception: assignment-links-variables
    feedback: "A number can't be changed, only replaced. `count = count - 5` moves the `count` label to a new number. `loaves` stays where it was."
  - text: |-
      40
      40
    misconception: assignment-copies-list
    feedback: "`same_tray = tray` doesn't copy the list. Both names are labels on one list, so a change made through one shows through the other."
---
Lists and dictionaries can be changed in place: they are **mutable**. Numbers, strings and tuples are **immutable**: you can't change a 40, only stick the label on a different number.

The two halves of this program look alike. Predict both.
