---
id: learn-input
type: learn
title: Asking a question
concept: input-returns-text
code: |
  answer = input("How many people? ")
  print(answer * 2)
inputs: ["6"]
---
`input()` lets a program ask a question. It shows the text in its brackets, waits for someone to type an answer and press Enter, then hands the answer back. Put a variable in front to keep it: `answer = input("How many people? ")`.

The answer always comes back as a string, even when someone types digits. Type `6`, and `answer` holds the text `"6"`, not the number 6.

`*` shows the difference. A number times 2 is doubled, but a string times 2 is the same text twice. So if you type `6`, the program on the right prints `66`.

That's the usual surprise: people expect 12. To do sums with an answer, you first turn it into a number. That's coming up.
