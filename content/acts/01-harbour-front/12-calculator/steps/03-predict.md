---
id: predict-try
type: predict
title: Which lines run
concept: try-except
code: |
  try:
      price = float("ten")
      print("Priced")
  except ValueError:
      print("Not a price")
  print("Next")
question: What does this print?
options:
  - text: |-
      Not a price
      Next
    correct: true
    feedback: "Right. `float(\"ten\")` fails, so the rest of the `try` is skipped, the `except` runs, and the program carries on underneath."
  - text: |-
      Priced
      Not a price
      Next
    misconception: try-finishes-block
    feedback: "Once a line in the `try` fails, the rest of the `try` is skipped. `Priced` never prints."
  - text: Not a price
    misconception: except-ends-program
    feedback: "An `except` doesn't end the program. When it's done, Python carries on with the next line underneath."
  - text: A ValueError traceback
    misconception: try-cannot-catch
    error: ValueError
    feedback: "The `except ValueError` is there to catch exactly this. There's no traceback: the `except` block runs instead."
after: |
  Run it. Then change `"ten"` to `"10"` and decide what it prints before you run it again.
---
You've seen what `except` does. Now decide exactly which lines run, and in what order.
