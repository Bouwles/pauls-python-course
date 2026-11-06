---
id: learn-more-methods
type: learn
title: A few more methods
concept: string-methods
code: |
  print("the puzzle room".title())
  print("Clocktower".count("o"))
  print("Workshop".startswith("Work"))
  print("ab".center(6, "-"))
---
The password checker needs only a handful of methods, but strings have plenty more. Four that come up often:

- `.title()` gives a copy with a capital at the start of each word: `"the puzzle room".title()` is `The Puzzle Room`.
- `.count("o")` counts how many times `"o"` appears: twice in `Clocktower`.
- `.startswith("Work")` is `True` if the string begins with `Work`, capitals and all.
- `.center(6, "-")` pads the string to 6 characters in all, with the text in the middle: `--ab--`. Without the `"-"`, it pads with spaces.

The usual mistake with `.center()` is reading the number as how much to add on each side. It's the total width.
