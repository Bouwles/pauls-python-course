---
id: learn-str
type: learn
title: Numbers into text
concept: str-conversion
code: |
  laps = 12
  print("Laps: " + str(laps))
  print(f"Laps: {laps}")
  print(str(2) + str(3))
---
`str()` turns a value into a string. `str(12)` is the text `"12"`, so `"Laps: " + str(laps)` joins two strings, and it works.

An f-string, from the Bill Splitter, does the same job without `+`: `f"Laps: {laps}"`. Use whichever reads better.

Once numbers are strings, `+` joins them side by side instead of adding them. So `str(2) + str(3)` is `"23"`, not 5. That's the usual surprise, and it's the same thing that happens to the digits people type into `input()`.
