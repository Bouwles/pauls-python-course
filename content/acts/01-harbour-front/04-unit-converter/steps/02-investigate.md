---
id: investigate
type: investigate
title: Which way it goes
concept: if-elif-else
code: |
  choice = input("Choose 1 or 2: ")
  if choice == "1":
      print("Km/h to mph")
  elif choice == "2":
      print("Knots to km/h")
  else:
      print("No such option.")
  print("Lights out.")
inputs: ["1"]
tasks:
  - id: two
    prompt: "Run it and type `2`. What does it print first?"
    kind: answer
    accept: ["Knots to km/h"]
    feedback: "Knots to km/h. `\"2\" == \"1\"` is `False`, so the first branch is skipped. `\"2\" == \"2\"` is `True`, so the `elif` gets it."
    wrong: "Run it again, type 2, and look at the first line of output."
  - id: how-many
    prompt: "Try `1`, `2` and `9`. How many of the three branches can print in one run?"
    kind: answer
    accept: ["1", "one", "just one", "only one"]
    feedback: "One. Python asks from the top, runs the first branch whose test is `True`, and skips the rest. The last line isn't indented, so it runs every time."
  - id: type-of-test
    prompt: "Add `print(type(choice == \"1\"))` at the end and run it. What type is `choice == \"1\"`?"
    kind: answer
    accept: ["bool", "<class 'bool'>", "boolean", "a bool"]
    feedback: "`bool`: a value that is either `True` or `False`. Every `if` is asking whether its test comes out `True`."
    wrong: "Look at the last line of output. It says <class '...'>."
  - id: third-option
    prompt: "Neil wants a third option. Make typing `3` print `Mach to km/h`, and keep `No such option.` for anything else."
    kind: run
    tests: |
      TESTS = [
          output("3 is Mach to km/h", inputs=["3"], expect="Mach to km/h\nLights out.", match="contains",
                 hint="Add another elif before the else, testing for the text \"3\"."),
          output("1 still works", inputs=["1"], expect="Km/h to mph\nLights out.", match="contains"),
          output("2 still works", inputs=["2"], expect="Knots to km/h\nLights out.", match="contains"),
          output("9 is still no such option", inputs=["9"], expect="No such option.\nLights out.", match="contains"),
      ]
    solution: |
      choice = input("Choose 1, 2 or 3: ")
      if choice == "1":
          print("Km/h to mph")
      elif choice == "2":
          print("Knots to km/h")
      elif choice == "3":
          print("Mach to km/h")
      else:
          print("No such option.")
      print("Lights out.")
---
`if` runs its indented lines only when its test is `True`. `elif` (else if) gets a turn only if every test above it was `False`. `else` takes whatever is left.

The indent, four spaces, is how Python knows which lines belong to which branch. The options are in quotes because `input()` gives back text.
