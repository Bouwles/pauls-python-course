---
id: learn-whole-division
type: learn
title: Pounds and pence
concept: arithmetic
code: |
  pence = 720
  print(pence // 100)
  print(pence % 100)
---
Two more signs, for splitting a number into whole parts. A till works in pence, so they're handy for money.

`//` divides and throws away whatever is left over: `720 // 100` is `7`, the whole pounds.

`%` gives only what's left over, called the remainder: `720 % 100` is `20`, the pence. So 720 pence is 7 pounds and 20 pence.

Both rank with `*` and `/`, so they happen before `+` and `-`.

The usual mistake is reading `%` as per cent. In Python it has nothing to do with percentages: it means remainder. A 10 per cent tip is worked out with `/`, as `bill * 10 / 100`.
