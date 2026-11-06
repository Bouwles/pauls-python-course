---
id: learn-two-places
type: learn
title: Money to the penny
concept: f-strings
code: |
  each = 10 / 4
  print(each)
  print(round(each, 2))
  print(f"Each pays: {each:.2f}")
---
Money is written with two decimal places: `2.50`, not `2.5`, and never `7.199999999999999`.

In an f-string, put `:.2f` after the value inside the curly brackets: `{each:.2f}`. It means "show this number with two decimal places". It rounds what's shown and adds zeros to fill both places, so the last line on the right prints `Each pays: 2.50`.

Python also has `round()`. `round(each, 2)` rounds the number itself to two places, but it never adds a zero, so it gives `2.5`. Fine for sums; not for a bill.

The usual mistake is thinking `:.2f` changes the number. It doesn't: `each` still holds `2.5`. Only what's shown changes.
