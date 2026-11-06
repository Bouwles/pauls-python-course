---
id: learn-tracebacks
type: learn
title: When a program crashes
concept: reading-tracebacks
code: |
  print("Rocket on the pad")
  print(10 / 0)
  print("Lift off")
error: ZeroDivisionError
---
When a line can't be done, Python stops the program there and prints a **traceback**: its note about what went wrong. Nothing is broken for good, and it's the most useful thing on the screen.

Run the program on the right. Line 1 prints. Line 2 tries to divide by zero, which can't be done, so the program stops. Line 3 never runs.

Read a traceback from the bottom:

- The last line names the error and says what went wrong: `ZeroDivisionError: division by zero`.
- Just above it are the line number, `line 2`, and that line copied out.

The usual mistake is starting at the top. The first line, `Traceback (most recent call last)`, is the same every time.
