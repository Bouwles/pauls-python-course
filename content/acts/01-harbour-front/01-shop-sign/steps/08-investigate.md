---
id: investigate
type: investigate
title: Change it and see
concept: comments
code: |
  # The note above the Workshop chalkboard
  print("Save your work")
  print("Then run it")
tasks:
  - id: count-lines
    prompt: "Press Run. The code has three lines. How many lines appear in the output?"
    kind: answer
    accept: ["2", "two"]
    feedback: "Two. Line 1 starts with `#`, so it's a comment, and Python skips it."
    wrong: "Count only the lines in the Output panel, not the lines of code."
  - id: remove-quotes
    prompt: "On line 2, delete both quote marks, so it reads `print(Save your work)`. Press Run. Python can't run it, and shows an error in red instead. What is the first word of the last red line?"
    kind: answer
    accept: ["SyntaxError", "syntaxerror", "Syntax Error", "SyntaxError:"]
    feedback: "SyntaxError: Python couldn't read the line. Without quotes, `Save your work` isn't a string any more, so Python tries to read the words as instructions, and they mean nothing to it. Put the quotes back before the last task."
    wrong: "Look at the red lines in the Output panel, above Neil's note. The last one starts with the kind of error, written as one word."
  - id: add-line
    prompt: "Add a fourth line that prints `Read errors from the bottom`. Press Run."
    kind: run
    tests: |
      TESTS = [
          output("Three lines", expect="Save your work\nThen run it\nRead errors from the bottom", hint="Each line of the note needs its own print(), with the text inside quotes. Check that line 2 has its quotes back."),
      ]
    solution: |
      # The note above the Workshop chalkboard
      print("Save your work")
      print("Then run it")
      print("Read errors from the bottom")
---
The note above the Workshop chalkboard, as a program. Each task changes one thing, so you can see what that part does. If you get lost, **Reset** in the `...` menu above the code puts it back.
