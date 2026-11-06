---
id: learn-value-error
type: learn
title: The right type, the wrong value
concept: value-error
code: |
  print(int("7"))
  print(int("seven"))
error: ValueError
---
A **ValueError** means a value had the right type but couldn't be used. `int()` takes a string, so `int("seven")` gives it the right type. But `"seven"` isn't written in digits, so `int()` can't read it, and the program stops. You met one in the Bill Splitter: `int("2.5")`.

A TypeError is the other way round: the type itself is wrong, like a number where `+` needed a string.

People mix the two up. Ask: was it the wrong kind of thing, or the right kind with the wrong contents? A ValueError often means something a person typed wasn't what the code expected.
