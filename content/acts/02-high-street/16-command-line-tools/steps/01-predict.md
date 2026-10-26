---
id: predict-argv
type: predict
title: What was typed
concept: sys-argv
code: |
  import sys

  # Moss types: python hours.py radio 3
  sys.argv = "hours.py radio 3".split()

  job = sys.argv[1]
  hours = sys.argv[2]
  print(job, hours * 2)
question: What does this print?
options:
  - text: radio 33
    correct: true
    feedback: "Right. `sys.argv[0]` is the program's own name, so the job is at 1 and the hours at 2. Everything typed arrives as text, and text times 2 is the text twice."
  - text: radio 6
    misconception: argv-gives-numbers
    feedback: "Arguments are always text, like `input()`. `\"3\" * 2` is `\"33\"`. Convert with `int()` before doing sums."
  - text: An IndexError
    misconception: argv-zero-is-first-argument
    error: IndexError
    feedback: "`sys.argv[0]` is the program's name, `hours.py`. Three words make three items, so index 2 is there: it's the `3`."
---
Moss starts his scripts from a terminal by typing the program's name, and sometimes a few words after it. Python puts those words in `sys.argv`, a list.

Line 4 fills `sys.argv` by hand, exactly as Python would if Moss typed that command.
