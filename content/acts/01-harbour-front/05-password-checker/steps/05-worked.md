---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Agnes asked for usernames first. I did those. Same shape, fewer rules."
code: |
  # Usernames for the harbour office
  name = input("Username? ")
  name = name.strip().lower()

  ok = True

  if len(name) < 3 or len(name) > 12:
      print("Between 3 and 12 characters.")
      ok = False
  if not name.replace(".", "").isalnum():
      print("Letters, numbers and dots only.")
      ok = False
  if "admin" in name:
      print("Not admin. Nobody is admin.")
      ok = False

  if ok:
      print(f"Username {name} is free.")
  else:
      print("Try another.")
inputs: ["  Admin-Pip "]
subgoals:
  - label: Ask, then tidy what was typed
    lines: [2, 3]
  - label: Assume it passes until a rule says otherwise
    lines: [5, 5]
  - label: Check each rule on its own, with a reason
    lines: [7, 15]
  - label: Give the verdict once, at the end
    lines: [17, 20]
explain:
  prompt: "Moss uses three separate `if`s, not `if`, `elif`, `elif`. What would `elif` do to `  Admin-Pip `?"
  answer: "Only the first broken rule would be reported. `elif` stops at the first test that is `True`, so the admin rule would never be asked. Pip would fix the hyphen and be turned away again."
  concept: if-elif-else
---
`name.strip().lower()` does two jobs in a row: `.strip()` hands back a new string, and `.lower()` works on that one.

`ok` is a bool that starts `True`. Every rule that fails prints its reason and sets `ok` to `False`. Nothing ever sets it back.

Line 10 takes the dots out of a copy, because dots are allowed and `.isalnum()` (letters and numbers only) would object to them.
