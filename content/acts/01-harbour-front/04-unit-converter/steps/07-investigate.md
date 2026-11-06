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
    prompt: "Press Run and type `2`. What is the first line of the output?"
    kind: answer
    accept: ["Knots to km/h"]
    feedback: "Knots to km/h. `\"2\" == \"1\"` is `False`, so the first block is skipped. `\"2\" == \"2\"` is `True`, so the `elif` gets it."
    wrong: "Run it again, type 2, and copy the first line of the output."
  - id: how-many
    prompt: "Run it three times, typing `1`, then `2`, then `9`. How many of the three indented blocks print in one run?"
    kind: answer
    accept: ["1", "one", "just one", "only one"]
    feedback: "One. Python asks from the top, runs the first block whose test is `True`, and skips the rest. `Lights out.` isn't indented, so it prints every time."
  - id: type-of-test
    prompt: "Add a new last line, `print(type(choice == \"1\"))`. Press Run and type anything. What type is `choice == \"1\"`?"
    kind: answer
    accept: ["bool", "<class 'bool'>", "boolean", "a bool"]
    feedback: "`bool`: `True` or `False`. Every `if` is asking whether its test comes out `True`."
    wrong: "Look at the last line of the output. It says <class '...'>."
  - id: third-option
    prompt: "Add an `elif` before the `else`, so typing `3` prints `Mach to km/h`. Press Run and type `3`."
    kind: run
    tests: |
      TESTS = [
          output("3 is Mach to km/h", inputs=["3"], expect="Mach to km/h\nLights out.", match="contains",
                 hint="Add another elif before the else, testing for the string \"3\", with its print indented under it."),
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
A two-option menu, with an `else` for anything else. The choices are in quotes because `input()` gives back a string.
