---
id: learn-raise
type: learn
title: Stopping on purpose
concept: raising-errors
code: |
  def check_level(level):
      if level not in ("INFO", "WARN", "ERROR"):
          raise ValueError(f"unknown level {level}")
      return level

  print(check_level("WARN"))
  print(check_level("LOUD"))
  print("Done")
error: ValueError
---
`raise ValueError("...")` stops the program on purpose, with your own message. It's how a function says "I can't work with this".

Neil's script raises one when a log line is the wrong shape. A loud stop beats a wrong answer that looks right.

It behaves like any error Python raises. The function stops there, the error travels back to the line that called it, and if nothing catches it, the program stops with your message on the last line of the traceback. So say exactly what was wrong, and where.

The example prints `WARN`, then stops with `ValueError: unknown level LOUD`. `Done` never prints.

The usual slip is to think `raise` prints its message and carries on. It stops everything, unless something catches it.
