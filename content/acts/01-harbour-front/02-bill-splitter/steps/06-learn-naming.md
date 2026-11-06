---
id: learn-naming
type: learn
title: Good names
concept: naming
code: |
  drink_price = 240
  drinks_ordered = 3
  print(drink_price * drinks_ordered)
---
You choose each variable's name, and Python has a few rules. A name can use letters, digits and the underscore `_`. It can't have spaces, and it can't start with a digit. Python style is lower-case words joined by underscores, like `drink_price`.

Python doesn't care what a name means: `x = 240` works just as well. People care. Name each variable for what it holds, and the code reads like a description of the job. `drink_price * drinks_ordered` says what it works out; `x * y` doesn't.

The usual mistake is a space. `drink price = 240` stops with an error, because Python sees two names side by side. Use an underscore instead.
