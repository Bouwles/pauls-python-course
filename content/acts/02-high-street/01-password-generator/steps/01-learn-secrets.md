---
id: learn-secrets
type: learn
title: Characters nobody can guess
concept: standard-library
code: |
  import secrets
  import string

  print(string.digits)
  print(string.ascii_uppercase)

  code = ""
  for _ in range(4):
      code += secrets.choice(string.digits)
  print(code)
---
`secrets` is a module like `random`, made for anything that must not be guessed, like a password. `secrets.choice(text)` picks one character from a piece of text.

The `string` module keeps the alphabet ready-made. `string.ascii_lowercase` is the 26 small letters, `string.ascii_uppercase` the 26 capitals, `string.ascii_letters` both, and `string.digits` is `0123456789`.

The loop builds a code one digit at a time. `code += digit` is short for `code = code + digit`. `_` is the usual name for a loop variable you never use. The example prints the digits, the capitals, then a four-digit code that changes every run.

The usual slip is to make passwords with `random`. What `random` picks can be worked out. What `secrets` picks can't.
