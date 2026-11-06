---
id: learn-syntax-error
type: learn
title: When Python can't read the code
concept: syntax-error
code: |
  print("Practice 09:30")
  print("Laps:" 12)
error: SyntaxError
---
A **SyntaxError** means Python couldn't read the code. Syntax is the grammar of a language: where the brackets, quotes and commas go.

Python reads the whole file before it runs any of it. So with a SyntaxError nothing runs at all, not even the lines above the mistake. Run the program on the right: line 1 is fine, but it doesn't print.

The note is shorter than a traceback. It names the line, copies it out, and puts `^` marks under the part Python couldn't read. Here, `Perhaps you forgot a comma?` is right: it should be `print("Laps:", 12)`.

The usual trap: the mistake can be just before the line named. A bracket left open on one line often shows up on the next.
