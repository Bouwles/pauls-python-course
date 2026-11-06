---
id: learn-type-error
type: learn
title: The wrong type for the job
concept: type-error
code: |
  laps = 12
  print("Laps: " + laps)
error: TypeError
---
A **TypeError** means a value is the wrong type for what you asked. The classic is `+` with a string on one side and a number on the other.

`+` joins two strings, and it adds two numbers. Given one of each, Python won't guess which you meant, so it stops. In the program on the right, `laps` holds the int 12, and line 2 tries to join it to a string.

The last line says `can only concatenate str (not "int") to str`. *Concatenate* means join: Python can only join a string to another string, and it was given an int.

The usual mistake is expecting Python to turn the number into text by itself. It never does, and the next step shows how.
