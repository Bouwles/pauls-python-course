---
id: learn-try
type: learn
title: Catching it
concept: try-except
code: |
  text = "twelve"
  try:
      number = float(text)
      print("Got", number)
  except ValueError:
      print("Not a number:", text)
  print("Carrying on.")
---
`try` and `except` catch an exception before it can stop the program.

`try:` runs the indented block under it. If a line in that block raises the error named after `except`, Python skips the rest of the block and runs the `except` block instead. Then it carries on underneath.

People will type `twelve` at Yahya's calculator. It mustn't fall over.

`float("twelve")` raises a ValueError, so `Got` never prints. The example prints `Not a number: twelve`, then `Carrying on.` Change line 1 to `text = "12"` and run it: now the `try` finishes and the `except` is skipped.

The usual slip is to expect the rest of the `try` block to run after the error. The moment a line fails, Python leaves the block.
