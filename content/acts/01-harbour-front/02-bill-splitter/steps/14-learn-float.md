---
id: learn-float
type: learn
title: Text to a decimal number
concept: float-conversion
code: |
  bill = input("Bill? ")
  bill = float(bill)
  print(bill * 2)
  print(0.1 + 0.2)
inputs: ["41.40"]
---
`float()` turns a string into a float, a number with a decimal point. It reads `"41.40"` and `"2.5"`, and whole numbers too: `float("7")` is `7.0`. Use it for anything that can have a decimal point, like a bill or a tip.

Floats have one catch. Python stores numbers in binary, as ones and zeros, and most decimals can't be stored exactly that way. The difference is tiny, but sometimes it shows: the last line on the right prints `0.30000000000000004`, not `0.3`.

The usual mistake is trusting a float to come out neat. Money needs tidying before anyone sees it, and a few steps on you'll see how.
