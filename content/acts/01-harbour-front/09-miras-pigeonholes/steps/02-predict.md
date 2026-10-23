---
id: predict
type: predict
title: Which parcel
concept: indexing
code: |
  parcels = ["Bea", "Tom", "Agnes", "Gwen"]
  print(parcels[1])
question: What does this print?
options:
  - text: Bea
    misconception: index-from-one
    feedback: "Python counts from 0. `parcels[0]` is Bea, so `parcels[1]` is the next one along: Tom."
  - text: Tom
    correct: true
    feedback: "Right. Index 0 is Bea, index 1 is Tom."
  - text: "['Tom']"
    misconception: index-gives-list
    feedback: "Square brackets after a list's name pick out one item. You get Tom himself, not a list with Tom in it."
after: |
  Run it.
---
A **list** keeps several values in order, between square brackets, separated by commas.

`parcels[1]` picks out one item by its index.
