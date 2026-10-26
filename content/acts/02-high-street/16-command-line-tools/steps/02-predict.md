---
id: predict-exit
type: predict
title: Stop everything
concept: exit-codes
code: |
  import sys


  def read_hours(text):
      if not text.isdigit():
          print("Hours must be a whole number.")
          sys.exit(1)
      return int(text)


  print(read_hours("3"))
  print(read_hours("three"))
  print("Logged.")
question: What does this print?
options:
  - text: |-
      3
      Hours must be a whole number.
    correct: true
    feedback: "Right. `sys.exit(1)` doesn't just leave `read_hours`. It ends the whole program there, so `Logged.` never prints."
  - text: |-
      3
      Hours must be a whole number.
      Logged.
    misconception: exit-only-leaves-function
    feedback: "`sys.exit` isn't `return`. It stops the entire program, from wherever it's called, and nothing after it runs."
  - text: |-
      3
      Hours must be a whole number.
      None
      Logged.
    misconception: exit-only-leaves-function
    feedback: "That's what would happen if `sys.exit` returned from the function like `return` with no value. It doesn't: the program ends on that line."
after: |
  Run it. Under the output, the console says which exit code the program finished with.
---
Every program finishes with an **exit code**, a number for whoever started it. 0 means it went well; anything else means it didn't. Moss's nightly backup script reads it to decide whether to carry on.

`sys.exit(1)` ends the program with exit code 1.
