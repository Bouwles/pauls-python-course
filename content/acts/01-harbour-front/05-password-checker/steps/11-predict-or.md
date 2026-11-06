---
id: predict-or
type: predict
title: Either one
concept: boolean-operators
code: |
  password = "Chalk-Dust-42"
  if password == "password" or "letmein":
      print("Too common.")
  else:
      print("Fine.")
question: What does this print?
options:
  - text: Fine.
    misconception: or-shares-comparison
    feedback: "The `password ==` isn't shared by both sides. Python reads it as `(password == \"password\") or \"letmein\"`, and a string that isn't empty counts as true."
  - text: Too common.
    correct: true
    feedback: "Right, and that's the trouble. The right-hand side is just `\"letmein\"`, which counts as true on its own, so every password is too common."
after: |
  Now run it. Then fix line 2 so it only catches those two: `password == "password" or password == "letmein"`.
---
Someone wrote this test for last year's accounts, to catch the two most common passwords. `Chalk-Dust-42` is neither of them.
