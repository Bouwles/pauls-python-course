---
id: learn-fstrings
type: learn
title: Values inside text
concept: f-strings
code: |
  people = 6
  total = 45.54
  print(f"{people} people, {total} in all")
---
An **f-string** is a string with an `f` just before the opening quote. Inside it, anything in curly brackets `{}` is worked out, and its value is dropped into the text.

So with `total = 45.54`, the f-string `f"Total: {total}"` is the text `Total: 45.54`. The brackets can hold a variable or a whole sum, like `{total / 6}`.

It's how you put numbers into a sentence, exactly where they belong, in one string you can read.

The usual mistake is forgetting the `f`. Without it, the curly brackets are just characters, and the program prints `Total: {total}`, name and brackets included.
