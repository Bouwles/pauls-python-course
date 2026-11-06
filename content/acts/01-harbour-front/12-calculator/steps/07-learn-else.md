---
id: learn-else
type: learn
title: Only if it worked
concept: try-except
code: |
  text = "4"
  try:
      weeks = float(text)
  except ValueError:
      print("Not a number.")
  else:
      print(f"{30 / weeks:.2f} a week")
---
`else:` after the `except` blocks runs only when nothing in the `try` went wrong.

It keeps the `try` small, around just the line that might fail, and gives the good answer a place of its own that an error can't reach.

Here `float("4")` works, so the `except` is skipped and the `else` prints `7.50 a week`. Change line 1 to `text = "four"` and run it: the `except` runs, and the `else` doesn't.

The usual slip is to think `else` runs every time, like the lines underneath. It only runs when the `try` finished without an error.
