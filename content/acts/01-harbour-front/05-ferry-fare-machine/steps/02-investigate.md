---
id: investigate
type: investigate
title: Which way it goes
concept: if-elif-else
code: |
  age = int(input("Age? "))
  if age < 5:
      print("Free")
  elif age < 16:
      print("Child")
  else:
      print("Adult")
  print("Mind the gangway.")
inputs: ["10"]
tasks:
  - id: five
    prompt: "Run it and type `5`. Which word does it print first?"
    kind: answer
    accept: ["Child"]
    feedback: "Child. 5 is not less than 5, so the first test fails. 5 is less than 16, so the `elif` gets it."
    wrong: "Run it again, type 5, and look at the first line of output."
  - id: how-many
    prompt: "Try a few more ages. How many of `Free`, `Child` and `Adult` can appear in one run?"
    kind: answer
    accept: ["1", "one", "just one", "only one"]
    feedback: "One. Python asks from the top, runs the first branch whose test is `True`, and skips the rest. The last line isn't indented, so it runs every time."
  - id: type-of-test
    prompt: "Add `print(type(age < 16))` at the end and run it. What type is `age < 16`?"
    kind: answer
    accept: ["bool", "<class 'bool'>", "boolean", "a bool"]
    feedback: "`bool`: a value that is either `True` or `False`. Every `if` is asking whether its test comes out `True`."
    wrong: "Look at the last line of output. It says <class '...'>."
  - id: pensioners
    prompt: "Ferro's pensioners pay less. Add a branch so anyone 65 or over gets `Pensioner`."
    kind: run
    tests: |
      TESTS = [
          output("70 is a pensioner", inputs=["70"], expect="Pensioner\nMind the gangway.", match="contains"),
          output("65 is a pensioner", inputs=["65"], expect="Pensioner\nMind the gangway.", match="contains",
                 hint="65 counts. Which comparison includes the number itself?"),
          output("30 is still an adult", inputs=["30"], expect="Adult\nMind the gangway.", match="contains"),
          output("10 is still a child", inputs=["10"], expect="Child\nMind the gangway.", match="contains"),
      ]
    solution: |
      age = int(input("Age? "))
      if age < 5:
          print("Free")
      elif age < 16:
          print("Child")
      elif age >= 65:
          print("Pensioner")
      else:
          print("Adult")
      print("Mind the gangway.")
---
`if` runs its indented lines only when its test is `True`. `elif` (else if) gets a turn only if every test above it was `False`. `else` takes whatever is left.

The indent, four spaces, is how Python knows which lines belong to which branch.
