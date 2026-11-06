---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.pleased: "Aaesha asked for usernames first. I did those. Same shape, fewer rules."
code: |
  # Usernames for the class server
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
inputs: ["  Admin-Neil "]
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
  prompt: "Paul uses three separate `if`s, not `if`, `elif`, `elif`. What would `elif` do to `  Admin-Neil `?"
  answer: "Only the first broken rule would be reported. `elif` stops at the first test that is `True`, so the admin rule would never be asked. Whoever typed it would fix the hyphen and be turned away again."
  concept: if-elif-else
---
A program like the password checker: Paul's rules for usernames. Three parts to look at closely:

- Line 3, `name.strip().lower()`, tidies what was typed: strip first, then lower case.
- `ok` is a bool that starts `True`. Every rule that fails prints its reason and sets `ok` to `False`, and nothing sets it back.
- `.isalnum()` is `True` when every character is a letter or a number. Line 10 takes the dots out of a copy first, because dots are allowed.

The four labels beside the code are Paul's steps. Your file for the Build starts with the same four, as comments.
