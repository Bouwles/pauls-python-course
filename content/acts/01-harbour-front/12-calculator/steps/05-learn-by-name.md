---
id: learn-by-name
type: learn
title: Each error by name
concept: try-except
code: |
  for text in ["6", "six", "0"]:
      try:
          print(30 / float(text))
      except ValueError:
          print(text, "isn't a number.")
      except ZeroDivisionError:
          print("Nothing divides by zero.")
---
An `except` only catches the error it names. `except ValueError:` catches a ValueError, and any other error gets straight past it and stops the program.

A calculator can go wrong in more than one way: a word for a number, or a zero to divide by. Each needs its own message.

So give each error its own `except`, one under another, lined up with the `try`. Python runs the first one that matches. The example tries three pieces of text and prints `5.0`, `six isn't a number.`, then `Nothing divides by zero.`

The usual slip is `except Exception:`, which catches every error there is. It catches your own typos too, and hides them behind the wrong message.
