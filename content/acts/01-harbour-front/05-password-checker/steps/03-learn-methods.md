---
id: learn-methods
type: learn
title: Strings answer questions
concept: string-methods
code: |
  password = "Chalk2019"
  print(password.lower())
  print(password.upper())
  print(password.isalpha())
  print("2019".isdigit())
---
A string comes with **methods**: small tools you call with a dot, a name and brackets, like `password.lower()`. Leave the brackets off and the method doesn't run.

`.lower()` hands back a copy in lower case, and `.upper()` a copy in capitals. That's how to ignore capitals: `"clock" in password.lower()` looks in a lower-case copy.

Methods whose names start with `is` answer with a bool. `.isalpha()` is `True` only if every character is a letter, `.isdigit()` only if every character is a digit, and `.isupper()` only if every letter is a capital.

"Every" is the usual catch. One capital isn't enough for `.isupper()`, and one digit makes `.isalpha()` `False`.
