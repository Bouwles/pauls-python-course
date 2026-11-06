---
id: learn-catch
type: learn
title: Catching it, and keeping the message
concept: try-except
code: |
  def check_level(level):
      if level not in ("INFO", "WARN", "ERROR"):
          raise ValueError(f"unknown level {level}")
      return level

  problems = []
  for level in ["WARN", "LOUD", "INFO"]:
      try:
          print(check_level(level))
      except ValueError as error:
          print("Skipped:", error)
          problems.append(str(error))
  print(problems)
---
An error you raise is caught like any other, with `try` and `except`. `except ValueError as error:` also keeps the error, in a variable called `error`. `str(error)` is its message: the text you gave `ValueError`.

That lets a program note what went wrong and carry on. Neil's report can keep each bad line's message and list them all at the end.

In the example, `LOUD` raises. The `except` catches it, keeps the message, and the loop goes on to `INFO`. It prints `WARN`, `Skipped: unknown level LOUD`, `INFO`, then the list of problems.

The usual slip is `except Exception:`. It catches every error there is, your own typos included, and hides the bugs you'd want to see. Name the error you expect.
