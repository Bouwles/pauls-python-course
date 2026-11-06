---
id: predict-nested
type: predict
title: Which key
concept: nested-data
code: |
  book = {
      "Paul": {"phone": "01632 960101", "address": "The Workshop"},
  }
  print(book["address"])
question: What happens when this runs?
verify: error
options:
  - text: It prints The Workshop
    misconception: nested-key-at-top
    feedback: "`address` is a key of Paul's record, not of `book`. `book[\"Paul\"][\"address\"]` would find the Workshop."
  - text: It prints None
    misconception: missing-key-gives-none
    feedback: "Square brackets never give `None` for a missing key. Only `.get()` does that. Square brackets crash."
  - text: A KeyError
    correct: true
    error: KeyError
    feedback: "`book` has one key, `\"Paul\"`. `address` lives one level down, so it's `book[\"Paul\"][\"address\"]`."
---
Riya's book, with one record in it so far.
