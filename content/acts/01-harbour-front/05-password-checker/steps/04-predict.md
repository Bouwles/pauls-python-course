---
id: predict-or
type: predict
title: Either one
concept: boolean-operators
code: |
  password = "Gull-Watch-42"
  if password == "password" or "letmein":
      print("Too common.")
  else:
      print("Fine.")
question: What does this print?
options:
  - text: Fine.
    misconception: or-shares-comparison
    feedback: "The `password ==` isn't shared by both sides. Python reads it as `(password == \"password\") or \"letmein\"`, and text that isn't empty counts as true."
  - text: Too common.
    correct: true
    feedback: "Right, and that's the trouble. The right-hand side is just `\"letmein\"`, which counts as true on its own, so every password is too common."
after: |
  Run it. Then fix line 2 so it only catches those two: `password == "password" or password == "letmein"`.
---
`and` is `True` only when both sides are. `or` is `True` when at least one side is. `not` turns `True` into `False` and back.

Each side has to be a whole question on its own. Agnes's deputy wrote this one.
