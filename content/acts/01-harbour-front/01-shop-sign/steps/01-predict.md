---
id: predict
type: predict
title: What will it print?
concept: program-order
code: |
  print("Mind the step")
  print("Ring the bell")
question: When this program runs, what appears?
options:
  - text: |-
      Mind the step
      Ring the bell
    correct: true
    feedback: "Right. Python runs the lines from the top down, one at a time, and each print() starts a new line."
  - text: |-
      Ring the bell
      Mind the step
    misconception: lines-run-in-any-order
    feedback: "Python doesn't choose an order. It starts at the top and works down, one line at a time."
  - text: |-
      print("Mind the step")
      print("Ring the bell")
    misconception: print-shows-code
    feedback: "print() shows what is inside the quotes, not the code itself. The quotes and brackets are instructions to Python."
  - text: Mind the step Ring the bell
    misconception: print-same-line
    feedback: "Each print() finishes its line. The next print() starts on a fresh one."
---
A program is a list of instructions. This one has two, and prints a small sign for a door.

Decide what you think will appear, then commit to it. Then run it and see.
