---
id: investigate
type: investigate
title: Asking the password questions
concept: string-methods
code: |
  password = "Harbour1987"
  print(len(password))
  print(password.isalpha())
  print(password[-4:])
  print(password.lower())
tasks:
  - id: length
    prompt: "Run it. What does `len(password)` give?"
    kind: answer
    accept: ["11", "eleven"]
    feedback: "11. `len` counts every character: letters, digits, spaces, everything."
  - id: isalpha
    prompt: "`.isalpha()` asks: is every character a letter? What does it answer here?"
    kind: answer
    accept: ["False"]
    feedback: "`False`. The digits aren't letters. `.isdigit()` asks the same about digits, and it would say `False` too, because of the letters."
    wrong: "Look at the second line of the output."
  - id: last-four
    prompt: "`password[-4:]` is a **slice**: the last four characters. What does that line print?"
    kind: answer
    accept: ["1987"]
    feedback: "`1987`. A negative position counts from the end, and leaving out the second number runs the slice to the end."
  - id: isupper
    prompt: "Add `print(password.isupper())` at the end. The password has a capital H, so you might expect `True`. What does it print?"
    kind: answer
    accept: ["False"]
    feedback: "`False`. `.isupper()` asks whether every letter is a capital. One capital isn't enough."
    wrong: "Run it and read the last line of the output."
  - id: has-capital
    prompt: "So how do you ask whether there's at least one capital? A password with no capitals is exactly the same as its lower-case copy. Add a last line that prints `True` if `password` has a capital and `False` if it has none."
    kind: run
    tests: |
      TESTS = [
          output("Harbour1987 has a capital", expect="True", match="last_line",
                 hint="Compare password with password.lower(). If they're different, something was a capital."),
          output("harbour1987 has none", set_vars={"password": "harbour1987"}, expect="False", match="last_line",
                 hint="Work from the variable password, so the answer changes when the password does."),
          output("All capitals", set_vars={"password": "GALE-1987"}, expect="True", match="last_line"),
      ]
    solution: |
      password = "Harbour1987"
      print(len(password))
      print(password.isalpha())
      print(password[-4:])
      print(password.lower())
      print(password != password.lower())
---
A string can answer questions about itself. Methods like `.isalpha()` hand back `True` or `False`. `.lower()` hands back a new string, the same text in lower case.

Positions in a string count from 0, and from -1 at the other end.

Change the code, run it, answer the questions.
