---
id: predict-strip
type: predict
title: Tidying the username
concept: immutability
code: |
  username = "  Yahya "
  username.strip()
  print(len(username))
question: What does this print?
options:
  - text: "5"
    misconception: string-method-changes-in-place
    feedback: "`.strip()` doesn't change `username`. It makes a new, tidy string and hands it back, and line 2 doesn't keep it. The spaces are all still there: 8 characters."
  - text: "8"
    correct: true
    feedback: "Right. A string can't be changed. `.strip()` made a new one without the spaces, and nobody kept it."
  - text: An error
    misconception: unused-result-is-error
    error: TypeError
    feedback: "Python doesn't mind you ignoring an answer. It works it out, then throws it away."
after: |
  Run it. Then change line 2 to `username = username.strip()` and run it again.
---
People type spaces before and after their usernames without noticing. `.strip()` gives back the text with the spaces taken off both ends.

Decide what this prints.
