---
id: learn-finally
type: learn
title: Whatever happens
concept: try-except
code: |
  for text in ["39.0", "warm"]:
      try:
          temperature = float(text)
      except ValueError:
          print("Not a number:", text)
      else:
          print("Read", temperature)
      finally:
          print("Next reading")
---
A `try` can end with two more blocks. You met `else:` in the Calculator: it runs only when the `try` had no error. `finally:` runs every time, error or not.

`finally` is for whatever must happen either way: counting a line as checked, or closing something you opened.

They go in this order: `try`, `except`, `else`, `finally`. Each one belongs to its `try`, so inside a loop they run once per pass. The example prints `Read 39.0` and `Next reading`, then `Not a number: warm` and `Next reading`.

The usual slip is to think `finally` waits for the end of the program, or only runs when things went well. It runs as soon as its `try` is finished, every time.
