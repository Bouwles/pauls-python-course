---
id: worked
type: worked
title: Reading from the bottom
language: text
dialogue:
  - paul.neutral.point: "Read it from the bottom. The last line is where it hurt."
code: |
  Morning, Neil
  Traceback (most recent call last):
    File "main.py", line 3, in <module>
      print("Practice starts at " + 9)
  TypeError: can only concatenate str (not "int") to str
subgoals:
  - label: Read the last line first. It names the error and says what went wrong
    lines: [5, 5]
  - label: Find the line number just above it
    lines: [3, 3]
  - label: Look at the line Python copied out for you
    lines: [4, 4]
  - label: Anything printed before the traceback ran fine
    lines: [1, 1]
explain:
  prompt: "Why read the last line before the line number?"
  answer: "The last line says what went wrong; the line number only says where. Knowing what you're looking for makes the where much quicker to fix."
  concept: reading-tracebacks
---
A **traceback** is Python's note about a crash. It is not a telling-off. It is the most useful thing on the screen.

"Concatenate" means join. Python is saying: I can only join text to text, and you gave me a whole number.
