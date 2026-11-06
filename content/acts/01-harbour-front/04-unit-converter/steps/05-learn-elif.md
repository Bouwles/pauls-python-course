---
id: learn-elif
type: learn
title: More than two ways
concept: if-elif-else
code: |
  lap = 61.2
  if lap < 60:
      print("Under a minute")
  elif lap < 62:
      print("Close")
  else:
      print("A slow one")
---
`elif`, short for "else if", adds more questions between the `if` and the `else`. Python asks them from the top, runs the block of the first test that is `True`, and skips all the rest. Only one block ever runs, and `else` takes whatever is left.

That makes a menu. Compare the choice with strings, `if choice == "1":`, because `input()` hands back a string, and a string never equals a number: `"1" == 1` is `False`, even though they look alike.

The usual mistake is expecting Python to pick the best match. It doesn't look ahead. It takes the first test that's `True`, so the order of the tests matters.
