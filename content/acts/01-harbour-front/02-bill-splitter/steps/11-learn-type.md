---
id: learn-type
type: learn
title: What kind of value
concept: type-function
code: |
  print(type(3))
  print(type(3.0))
  print(type("3"))
---
Every value has a **type**: the kind of value it is. `type()` tells you which. `print(type(3))` prints `<class 'int'>`, which is Python's way of saying "this is an int".

Three types so far:

- `int`, short for integer: a whole number, like `3`
- `float`: a number with a decimal point, like `3.0` or `7.2`
- `str`, short for string: text, like `"3"`

An int and a str can look exactly alike: `print(3)` and `print("3")` both show `3`. So `type()` is how you tell them apart. When a program does something strange, checking a type is often the first useful thing to do.

`type()` doesn't change anything. It only tells you what's there.
