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
      laps = int("4.5")
  ValueError: invalid literal for int() with base 10: '4.5'
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
This is what the Quick check's program printed. The labels beside it are the order Paul reads a traceback in. Use the same order on each of Neil's five scripts.

The last line is the hardest to read. *Invalid literal for int()* means "text `int()` can't read", and *base 10* means ordinary digits. So: `int()` was given `'4.5'`, and that isn't a whole number.
