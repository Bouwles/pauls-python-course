---
id: predict-upper
type: predict
title: Capitals
concept: immutability
code: |
  title = "lost oar"
  title.upper()
  print(title)
question: What does this print?
options:
  - text: LOST OAR
    misconception: string-method-changes-in-place
    feedback: "`.upper()` doesn't change `title`. It makes a new string in capitals and hands it back. Line 2 drops it."
  - text: lost oar
    correct: true
    feedback: "Right. A string can't be changed. `.upper()` made a new one, and nobody kept it."
  - text: An error
    misconception: unused-result-is-error
    error: TypeError
    feedback: "Python doesn't mind you ignoring an answer. It works it out, then throws it away."
after: |
  Run it. Then change line 2 to `title = title.upper()` and run it again.
---
Strings have methods too. `title.upper()` gives you a capital-letter version of `title`.

Agnes wants every title in capitals. Decide what this prints.
