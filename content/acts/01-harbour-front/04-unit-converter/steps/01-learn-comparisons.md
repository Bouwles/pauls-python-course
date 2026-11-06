---
id: learn-comparisons
type: learn
title: Yes-or-no questions
concept: comparisons
code: |
  speed = 340
  print(speed > 300)
  print(speed == 300)
  print(300 > 300)
---
A **comparison** asks a question with a yes-or-no answer, like "is the speed over 300?". Python has six:

- `<` less than, and `>` more than
- `<=` less than or equal to, and `>=` more than or equal to
- `==` equal to, and `!=` not equal to

The answer is `True` or `False`. With `speed = 340`, `speed > 300` is `True` and `speed == 300` is `False`.

`>` means strictly more than, so `300 > 300` is `False`. `>=` is the one that lets 300 itself in.

The usual mistake is `=` where you mean `==`. One equals sign puts a name on a value. Two equals signs ask whether two values are the same.
