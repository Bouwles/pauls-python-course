---
id: learn-bool
type: learn
title: True and False
concept: bool
code: |
  speed = 340
  is_fast = speed > 300
  print(is_fast)
  print(type(is_fast))
---
`True` and `False` are values of their own type, called **bool**. They're written with a capital letter and no quotes, and every comparison gives back one of them.

You can keep a bool in a variable, like any other value: `is_fast = speed > 300`. Then `print(is_fast)` prints `True`, and `type(is_fast)` is `<class 'bool'>`.

The usual mistake is putting quotes round them. `"True"` in quotes is a string, four letters of text, not a bool. And lower-case `true` isn't anything: Python reads it as a name it doesn't know, and stops with a NameError.
