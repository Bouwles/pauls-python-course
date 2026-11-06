---
id: learn-exit
type: learn
title: How it finished
concept: exit-codes
code: |
  import sys

  screws = 0
  if screws == 0:
      print("Out of brass screws.", file=sys.stderr)
      sys.exit(1)
  print("Plenty left.")
---
Every program finishes with an **exit code**: a number for whatever started it. 0 means it went well, and anything else means it didn't. Reaching the end of the program gives 0.

Scripts read it. Paul's nightly backup only copies the files if every tool before it finished with 0.

`sys.exit(1)` ends the whole program on the spot, with code 1, from wherever it's called. Problems go to `sys.stderr`, a second output kept for trouble: `print(..., file=sys.stderr)`. That way they never get mixed in with the results. The example prints the message, and the console shows it finished with exit code 1.

The usual slip is a failure that prints a message and still finishes with 0. To a script, that looks like success.
