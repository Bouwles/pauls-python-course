---
id: predict-input
type: predict
title: Listening
concept: input-returns-text
code: |
  count = input("How many? ")
  print(count * 2)
inputs: ["3"]
question: "If you type `3`, what does this print?"
options:
  - text: "6"
    misconception: input-returns-number
    feedback: "input() always hands you text. The text \"3\" doubled is \"33\"."
  - text: "33"
    correct: true
    feedback: "Right. input() gives you text, and text times 2 is the text twice."
  - text: An error
    misconception: str-times-int-errors
    error: TypeError
    feedback: "Text times a whole number is allowed in Python. It repeats the text."
  - text: "3 3"
    misconception: repetition-adds-space
    feedback: "Repeating text doesn't add anything between the copies. \"3\" twice is \"33\"."
after: |
  Now run it and type `3` yourself.
---
A bill splitter has to ask: how much, and how many.

`input()` shows a question, waits for someone to type an answer and press Enter, then hands the answer to your program.

Commit to an answer, then run it.
