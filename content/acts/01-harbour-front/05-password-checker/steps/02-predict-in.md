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
    feedback: "To Python, `C` and `c` are different characters. The password starts with a capital, so `\"clocktower\"` with a small c isn't in it."
  - text: "False"
    correct: true
    feedback: "Right. `in` looks for exactly those letters, capitals and all. The password has `Clocktower`, with a capital C."
  - text: "0"
    misconception: in-gives-position
    feedback: "`in` doesn't say where. It only answers yes or no: `True` or `False`."
---
Last year, every account on the class server had `clocktower1` as its password. Aaesha keeps her experiment results there, and she would like that stopped.
