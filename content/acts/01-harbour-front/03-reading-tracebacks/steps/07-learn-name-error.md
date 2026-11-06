---
id: learn-name-error
type: learn
title: A name Python doesn't know
concept: name-error
code: |
  track = "indoor track"
  print(trak)
error: NameError
---
A **NameError** means Python met a name it hasn't been told about. There are three usual reasons:

- a typo, like `trak` for `track`
- a variable used before the line that gives it a value
- text with its quotes missing, so Python reads the word as a name

Names must match exactly, capital letters included: `Race` and `race` are two different names.

Run the program on the right. The last line of the traceback says `NameError: name 'trak' is not defined. Did you mean: 'track'?` Python often suggests the name you meant, right at the end, so read the line to the end.
