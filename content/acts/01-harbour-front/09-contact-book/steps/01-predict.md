---
id: predict-dict
type: predict
title: Labelled pigeonholes
concept: dictionaries
code: |
  book = {"Bea": "Quay Row", "Tom": "Point Road"}
  book["Bea"] = "Mill Lane"
  print(book["Bea"])
question: What does this print?
options:
  - text: Quay Row
    misconception: dict-existing-key-ignored
    feedback: "Line 2 fills Bea's pigeonhole again. The old address is replaced, not kept."
  - text: Mill Lane
    correct: true
    feedback: "Right. Each key appears once. Giving it a new value replaces the old one."
  - text: "['Quay Row', 'Mill Lane']"
    misconception: dict-key-holds-many
    feedback: "A key holds one value. Assigning again swaps it; it doesn't add a second."
  - text: An error
    misconception: dict-existing-key-ignored
    error: KeyError
    feedback: "Changing a value that's already there is allowed. It's how addresses get updated."
after: |
  Run it. Then add `book["Mira"] = "Post Office"` before the print, and print `book`.
---
A **dictionary** is a row of labelled pigeonholes. Each **key** (a name) holds one **value** (an address).

`book["Bea"]` looks in Bea's pigeonhole. `book["Bea"] = ...` fills it.
