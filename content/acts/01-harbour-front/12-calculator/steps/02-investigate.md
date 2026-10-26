---
id: investigate
type: investigate
title: Try, and catch
concept: try-except
code: |
  text = input("Miles? ")
  try:
      miles = float(text)
      print(f"{30 / miles:.1f} litres a mile")
  except ValueError:
      print("That isn't a number.")
  print("Next sum.")
inputs: ["six"]
tasks:
  - id: caught
    prompt: "Run it and type `six`. What is the last line it prints?"
    kind: answer
    accept: ["Next sum.", "Next sum"]
    feedback: "`Next sum.` The `except` caught the ValueError and printed its message, and then the program carried on underneath, as if nothing had happened."
    wrong: "Look at the very last line of the output."
  - id: skipped
    prompt: "Type `six` again. Line 4 is inside the `try`. Did it run?"
    kind: answer
    accept: ["no", "it didn't", "no, it didn't"]
    feedback: "No. The moment `float()` fails on line 3, Python leaves the `try` and jumps to the `except`. The rest of the `try` is skipped."
  - id: zero
    prompt: "Now type `0`. What kind of error stops it?"
    kind: answer
    accept: ["ZeroDivisionError", "ZeroDivisionError: float division by zero", "zero division error", "zerodivision error"]
    feedback: "A ZeroDivisionError. This `except` only catches ValueError, so a different error gets straight past it and stops the program. You catch what you name."
    wrong: "Read the last line of the traceback. The first word is the kind of error."
  - id: second-except
    prompt: "Add a second `except`, for `ZeroDivisionError`, that prints `No miles, no fuel.` Then typing `0` should end with `Next sum.` too."
    kind: run
    tests: |
      TESTS = [
          output("Typing 0", inputs=["0"], expect="No miles, no fuel.\nNext sum.",
                 hint="A second except goes under the first one's block, lined up with it: except ZeroDivisionError:"),
          output("Typing six", inputs=["six"], expect="That isn't a number.\nNext sum."),
          output("Typing 6", inputs=["6"], expect="5.0 litres a mile\nNext sum."),
      ]
    solution: |
      text = input("Miles? ")
      try:
          miles = float(text)
          print(f"{30 / miles:.1f} litres a mile")
      except ValueError:
          print("That isn't a number.")
      except ZeroDivisionError:
          print("No miles, no fuel.")
      print("Next sum.")
---
`try:` runs a block that might go wrong. If it does, and the error is the kind named after `except`, the `except` block runs instead of a traceback.

The ferry burns 30 litres a crossing. This works out how much a mile, from the miles you type.
