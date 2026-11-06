---
id: investigate
type: investigate
title: Asking the password questions
concept: string-methods
code: |
  password = "Clocktower1987"
  print(len(password))
  print(password.isalpha())
  print(password[-4:])
  print(password.lower())
tasks:
  - id: length
    prompt: "Press Run. What does `len(password)` give, on the first line?"
    kind: answer
    accept: ["14", "fourteen"]
    feedback: "14. `len()` counts every character: ten letters and four digits."
  - id: isalpha
    prompt: "What does `password.isalpha()` answer, on the second line?"
    kind: answer
    accept: ["False"]
    feedback: "`False`. The digits aren't letters. `.isdigit()` would say `False` too, because of the letters."
    wrong: "Look at the second line of the output."
  - id: last-four
    prompt: "What does the slice `password[-4:]` print, on the third line?"
    kind: answer
    accept: ["1987"]
    feedback: "`1987`, the last four characters. That's the slice Aaesha's sixth rule needs."
  - id: isupper
    prompt: "Add a new last line, `print(password.isupper())`. Press Run. The password has a capital C. What does the new line print?"
    kind: answer
    accept: ["False"]
    feedback: "`False`. `.isupper()` asks whether every letter is a capital. One capital isn't enough."
    wrong: "Run it and read the last line of the output."
  - id: has-capital
    prompt: "A password with no capitals is exactly the same as its lower-case copy. Add a last line that prints whether `password` is different from `password.lower()`. Press Run."
    kind: run
    tests: |
      TESTS = [
          output("Clocktower1987 has a capital", expect="True", match="last_line",
                 hint="Compare password with password.lower() using !=, and print the answer."),
          output("clocktower1987 has none", set_vars={"password": "clocktower1987"}, expect="False", match="last_line",
                 hint="Work from the variable password, so the answer changes when the password does."),
          output("All capitals", set_vars={"password": "CLOCK-1987"}, expect="True", match="last_line"),
      ]
    solution: |
      password = "Clocktower1987"
      print(len(password))
      print(password.isalpha())
      print(password[-4:])
      print(password.lower())
      print(password != password.lower())
---
Aaesha's least favourite password, and some questions to ask it. Each one uses a method or a slice from the last two steps.
