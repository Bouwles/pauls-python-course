---
id: predict-in
type: predict
title: Is it in there
concept: in-operator
code: |
  password = "Harbour1987"
  print("harbour" in password)
question: What does this print?
options:
  - text: "True"
    misconception: string-compare-ignores-case
    feedback: "To Python, `H` and `h` are different characters. The password starts with a capital, so `\"harbour\"` with a small h isn't in it."
  - text: "False"
    correct: true
    feedback: "Right. `in` looks for exactly those letters, capitals and all. The password has `Harbour`, with a capital H."
  - text: "0"
    misconception: in-gives-position
    feedback: "`in` doesn't say where. It only answers yes or no: `True` or `False`."
after: |
  Run it. Then try `"bour" in password`, and `"harbour" in password.lower()`.
---
Four people at the harbour office chose `harbour1` as their password. Agnes would like that stopped.

`in` asks whether one piece of text appears anywhere inside another: `"tide" in "riptide"` is `True`. Like a comparison, it always answers `True` or `False`.

Commit to an answer, then run it.
