---
id: learn-boolean
type: learn
title: and, or, not
concept: boolean-operators
code: |
  hour = 20
  print(hour < 7 or hour >= 19)
  print(hour < 7 and hour >= 19)
  print(not hour < 7)
---
`and`, `or` and `not` join bools together:

- `a and b` is `True` only when both sides are `True`.
- `a or b` is `True` when at least one side is, including when both are.
- `not a` turns `True` into `False`, and `False` into `True`.

So with `hour = 20`, `hour < 7 or hour >= 19` is `True`, because the second side is.

Each side has to be a whole question. The usual mistake is `choice == "y" or "yes"`. It reads well, but Python doesn't share the `choice ==` between the two sides. The right side is just the string `"yes"`, and Python counts any string that isn't empty as true, so the whole thing is always `True`.
