---
id: predict
type: predict
title: Where did it break?
concept: reading-tracebacks
code: |
  name = "Agnes"
  print("Morning, " + name)
  print("Tide at " + 7)
question: This program crashes. Which line causes it?
verify: crash-line
options:
  - text: Line 1
    misconception: error-is-at-the-top
    feedback: "Line 1 just puts a label on some text. Nothing wrong there. Errors happen where the bad instruction is, not at the top."
  - text: Line 2
    misconception: plus-cannot-join-text
    feedback: "`+` joins text to text perfectly well. \"Morning, \" + \"Agnes\" is \"Morning, Agnes\"."
  - text: Line 3
    correct: true
    feedback: "Right. `+` can join text to text, but 7 is a number, and Python won't guess what you meant."
  - text: It doesn't crash
    misconception: plus-joins-text-and-numbers
    feedback: "Python won't join text and a number with `+`. It wants you to say which you meant: the text \"7\", or adding up."
after: |
  Run it. Notice that line 2 still printed before the crash.
---
Programs run from the top down, so a program can do some of its work and then crash.

Pick the line you think breaks it, then run it and read what Python says.
