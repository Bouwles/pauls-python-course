---
id: investigate
type: investigate
title: Poke at it
concept: comments
code: |
  # The note above the Workshop chalkboard
  print("Save your work")
  print("Then run it")
tasks:
  - id: count-lines
    prompt: "Run it. How many lines appear in the output?"
    kind: answer
    accept: ["2", "two"]
    feedback: "Two. The first line starts with `#`, so Python skips it. That's a comment: a note for whoever reads the code next."
    wrong: "Count again, only the lines in the output panel. The code has three lines, but one of them is skipped."
  - id: remove-quotes
    prompt: "Remove the quotes around `Save your work` and run it. What is the first word on the last line of the error?"
    kind: answer
    accept: ["SyntaxError", "syntaxerror", "Syntax Error"]
    feedback: "SyntaxError. Without quotes, Python reads `Save`, `your` and `work` as names, not text, and names side by side don't make sense to it. Quotes mark the start and end of text."
    wrong: "Look at the very last line of the red text. It starts with the kind of error."
  - id: add-line
    prompt: "Put the quotes back. Then add a third line to the note that says `Read errors from the bottom`, and run it."
    kind: run
    tests: |
      TESTS = [
          output("Three lines", expect="Save your work\nThen run it\nRead errors from the bottom", hint="Each line of the note needs its own print(), with the text inside quotes."),
      ]
    solution: |
      # The note above the Workshop chalkboard
      print("Save your work")
      print("Then run it")
      print("Read errors from the bottom")
---
Read the code, then work through the questions on the left. Change anything you like; you can always reset it.
