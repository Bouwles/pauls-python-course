---
id: predict-precedence
type: predict
title: Which sum first?
concept: operator-precedence
code: |
  print(2 + 3 * 4)
question: What does this print?
options:
  - text: "20"
    misconception: left-to-right-always
    feedback: "Python doesn't just go left to right. Multiplication happens before addition, as in maths: 3 * 4 first, then add 2."
  - text: "14"
    correct: true
    feedback: "Right. `*` before `+`, the same order you'd use on paper."
  - text: "2 + 3 * 4"
    misconception: print-shows-code
    feedback: "There are no quotes, so this isn't text. Python works the sum out and prints the answer."
---
Without quotes, Python treats numbers as numbers and works the sum out before printing it.

`*` means times. `/` means divide.
