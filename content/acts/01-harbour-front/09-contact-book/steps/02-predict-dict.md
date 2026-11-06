---
id: predict-dict
type: predict
title: A new room
concept: dictionaries
code: |
  book = {"Neil": "The Puzzle Room", "Yahya": "The Archive"}
  book["Neil"] = "The Workshop"
  print(book["Neil"])
question: What does this print?
options:
  - text: The Puzzle Room
    misconception: dict-existing-key-ignored
    feedback: "Line 2 gives the key `\"Neil\"` a new value. The old room is replaced, not kept."
  - text: The Workshop
    correct: true
    feedback: "Each key appears once. Giving it a new value replaces the old one, so Neil's room is now the Workshop."
  - text: "['The Puzzle Room', 'The Workshop']"
    misconception: dict-key-holds-many
    feedback: "A key holds one value. Assigning again swaps it; it doesn't add a second."
  - text: An error
    misconception: dict-existing-key-ignored
    error: KeyError
    feedback: "Changing a value that's already there is allowed. It's how a record gets updated."
---
Riya is noting where everyone can be found. Line 2 changes her mind about Neil.
