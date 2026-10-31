---
id: predict-in
type: predict
title: Is it in there
concept: in-operator
code: |
  password = "Clocktower1987"
  print("clocktower" in password)
question: What does this print?
options:
  - text: "True"
    misconception: string-compare-ignores-case
    feedback: "To Python, `H` and `h` are different characters. The password starts with a capital, so `\"clocktower\"` with a small c isn't in it."
  - text: "False"
    correct: true
    feedback: "Right. `in` looks for exactly those letters, capitals and all. The password has `Clocktower`, with a capital C."
  - text: "0"
    misconception: in-gives-position
    feedback: "`in` doesn't say where. It only answers yes or no: `True` or `False`."
after: |
  Run it. Then try `"tower" in password`, and `"clocktower" in password.lower()`.
---
Last year, every shared account in the class had `clocktower1` as its password. Aaesha would like that stopped.

`in` asks whether one piece of text appears anywhere inside another: `"tower" in "clocktower"` is `True`. Like a comparison, it always answers `True` or `False`.

Lock in your answer, then run it.
