---
id: investigate
type: investigate
title: Poke at it
concept: comments
code: |
  # The sign for Bea's window
  print("Fresh bread")
  print("Closed Mondays")
tasks:
  - id: count-lines
    prompt: "Run it. How many lines appear in the output?"
    kind: answer
    accept: ["2", "two"]
    feedback: "Two. The first line starts with `#`, so Python skips it. That's a comment: a note for whoever reads the code next."
    wrong: "Count again, only the lines in the output panel. The code has three lines, but one of them is skipped."
  - id: remove-quotes
    prompt: "Remove the quotes around `Fresh bread` and run it. What is the first word on the last line of the error?"
    kind: answer
    accept: ["SyntaxError", "syntaxerror", "Syntax Error"]
    feedback: "SyntaxError. Without quotes, Python reads `Fresh` and `bread` as names, not text, and two names side by side don't make sense to it. Quotes mark the start and end of text."
    wrong: "Look at the very last line of the red text. It starts with the kind of error."
  - id: add-line
    prompt: "Put the quotes back. Then add a third line to the sign that says `Ring the bell`, and run it."
    kind: run
    tests: |
      TESTS = [
          output("Three lines", expect="Fresh bread\nClosed Mondays\nRing the bell", hint="Each line of the sign needs its own print(), with the text inside quotes."),
      ]
    solution: |
      # The sign for Bea's window
      print("Fresh bread")
      print("Closed Mondays")
      print("Ring the bell")
---
Read the code, then work through the questions on the left. Change anything you like; you can always reset it.
