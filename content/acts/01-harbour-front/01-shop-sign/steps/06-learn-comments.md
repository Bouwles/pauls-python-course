---
id: learn-comments
type: learn
title: Notes for people
concept: comments
code: |
  # A note for the duck on Neil's desk
  print("Please do not squeeze")
  print("Ask it about your bug")  # it never answers
---
A **comment** is a note in the code for people to read. It starts with `#`, and Python skips everything from the `#` to the end of that line. Nothing in a comment runs or prints.

Programs usually start with a comment saying what they're for, like line 1 on the right. Then the next person to open the file knows what it is before reading any code. Often that next person is you, a month later.

A comment can also go at the end of a line, as on line 3. The code before the `#` still runs.

Run it: two lines appear, and neither note does. People sometimes expect comments in the output. They never are. Only `print()` puts words there.
