---
id: learn-immutability
type: learn
title: Strings can't be changed
concept: immutability
code: |
  name = "riya"
  name.upper()
  print(name)
  name = name.upper()
  print(name)
---
Once a string exists, it can't be changed. Methods like `.upper()`, `.strip()` and `.replace()` hand back a new string, and leave the old one as it was.

So line 2 of the example does nothing useful. `name.upper()` makes `"RIYA"` and hands it back, but nobody keeps it, so `name` still holds `"riya"`.

To keep the new string, move the label onto it with `=`, as line 4 does: `name = name.upper()`. You can't change one character, either: `name[0] = "R"` stops with a TypeError.

The usual mistake is calling a method and expecting the variable to change. It never does. Python doesn't complain, either: it works out the answer, and throws it away.
