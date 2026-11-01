---
id: predict-dict
type: predict
title: Labelled pigeonholes
concept: dictionaries
code: |
  book = {"Neil": "The Puzzle Room", "Yahya": "The Archive"}
  book["Neil"] = "The Workshop"
  print(book["Neil"])
question: What does this print?
options:
  - text: The Puzzle Room
    misconception: dict-existing-key-ignored
    feedback: "Line 2 fills Neil's pigeonhole again. The old room is replaced, not kept."
  - text: The Workshop
    correct: true
    feedback: "Right. Each key appears once. Giving it a new value replaces the old one."
  - text: "['The Puzzle Room', 'The Workshop']"
    misconception: dict-key-holds-many
    feedback: "A key holds one value. Assigning again swaps it; it doesn't add a second."
  - text: An error
    misconception: dict-existing-key-ignored
    error: KeyError
    feedback: "Changing a value that's already there is allowed. It's how a record gets updated."
after: |
  Run it. Then add `book["Caitlin"] = "The Studio"` before the print, and print `book`.
---
A **dictionary** is a row of labelled pigeonholes. Each **key** (a name) holds one **value** (a room).

`book["Neil"]` looks in Neil's pigeonhole. `book["Neil"] = ...` fills it.
