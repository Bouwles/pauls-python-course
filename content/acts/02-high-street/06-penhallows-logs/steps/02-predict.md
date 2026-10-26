---
id: predict-try
type: predict
title: Catching it
concept: try-except
code: |
  try:
      depth = float("deep")
      print("Depth read")
  except ValueError:
      print("Not a number")
  print("Carrying on")
question: What does this print?
options:
  - text: |-
      Not a number
      Carrying on
    correct: true
    feedback: "Right. The error on line 2 jumps straight to the `except`, skipping the rest of the `try`. Then the program carries on underneath."
  - text: |-
      Depth read
      Not a number
      Carrying on
    misconception: try-finishes-block
    feedback: "The `try` block stops at the line that fails. `print(\"Depth read\")` comes after it, so it never runs."
  - text: Not a number
    misconception: except-ends-program
    feedback: "Once the `except` block has dealt with the error, the program carries on as normal, so line 6 runs."
  - text: A ValueError traceback
    misconception: try-cannot-catch
    feedback: "Without the `try`, yes. With it, the ValueError is caught by `except ValueError:` and never reaches the top."
after: |
  Run it. Then change `"deep"` to `"4.2"` and run it again.
---
`try:` runs a block that might go wrong. If a `ValueError` happens inside it, Python jumps to the `except ValueError:` block instead of stopping the program.

One of the tide gauge's readings isn't a number.
