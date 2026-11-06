---
id: predict
type: predict
title: What will it print?
concept: program-order
code: |
  print("Mind the step")
  print("Ring the bell")
question: What does this program print?
options:
  - text: |-
      Mind the step
      Ring the bell
    correct: true
    feedback: "Right. Python runs line 1, then line 2, and each `print()` shows its words on a new line."
  - text: |-
      Ring the bell
      Mind the step
    misconception: lines-run-in-any-order
    feedback: "Python never picks the order. It runs line 1 first, so `Mind the step` comes first."
  - text: |-
      print("Mind the step")
      print("Ring the bell")
    misconception: print-shows-code
    feedback: "`print()` shows only the words inside the quotes. The word `print`, the brackets and the quotes are instructions to Python, so they don't appear."
  - text: Mind the step Ring the bell
    misconception: print-same-line
    feedback: "Each `print()` finishes its own line, so the second one starts on a new line underneath."
---
A sign for a door, as a program with two `print()` lines. You've seen everything it uses: the order the lines run in, and what `print()` shows.
