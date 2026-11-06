---
id: investigate
type: investigate
title: Try, and catch
concept: try-except
code: |
  text = input("Weeks? ")
  try:
      weeks = float(text)
      print(f"{30 / weeks:.1f} a week")
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
    prompt: "Run it and type `six` again. Line 4 is inside the `try`. Did it run? Answer yes or no."
    kind: answer
    accept: ["no", "it didn't", "no, it didn't"]
    feedback: "No. The moment `float()` fails on line 3, Python leaves the `try` and jumps to the `except`. The rest of the `try` is skipped."
  - id: zero
    prompt: "Run it and type `0`. What kind of error stops it?"
    kind: answer
    accept: ["ZeroDivisionError", "ZeroDivisionError: float division by zero", "zero division error", "zerodivision error"]
    feedback: "A ZeroDivisionError. This `except` only catches ValueError, so a different error gets straight past it and stops the program. You catch what you name."
    wrong: "Read the last line of the traceback. The first word is the kind of error."
  - id: second-except
    prompt: "Add a second `except`, for `ZeroDivisionError`, that prints `No weeks, no budget.` Put it under the first `except` block, lined up with it. Then typing `0` should end with `Next sum.` too."
    kind: run
    tests: |
      TESTS = [
          output("Typing 0", inputs=["0"], expect="No weeks, no budget.\nNext sum.",
                 hint="A second except goes under the first one's block, lined up with it: except ZeroDivisionError:"),
          output("Typing six", inputs=["six"], expect="That isn't a number.\nNext sum."),
          output("Typing 6", inputs=["6"], expect="5.0 a week\nNext sum."),
      ]
    solution: |
      text = input("Weeks? ")
      try:
          weeks = float(text)
          print(f"{30 / weeks:.1f} a week")
      except ValueError:
          print("That isn't a number.")
      except ZeroDivisionError:
          print("No weeks, no budget.")
      print("Next sum.")
---
The class fund has 30 pounds for snacks. This works out how much that is a week, from the weeks you type.
