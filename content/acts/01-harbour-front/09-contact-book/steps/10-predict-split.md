---
id: predict-split
type: predict
title: The third piece
concept: split-join
code: |
  line = "Neil, 01632 960245, The Puzzle Room"
  parts = line.split(", ")
  print(parts[2])
question: What does this print?
options:
  - text: The Puzzle Room
    correct: true
    feedback: "The line splits into three pieces, at the two comma-and-spaces. Index 2 is the third: the address."
  - text: "01632 960245"
    misconception: index-from-one
    feedback: "Indexes start at 0. `parts[0]` is Neil, `parts[1]` the phone, and `parts[2]` the address."
  - text: The
    misconception: split-cuts-every-space
    feedback: "`.split(\", \")` only cuts where it finds a comma followed by a space. The spaces inside `The Puzzle Room` stay put."
---
A contact for Neil, typed on one line.
