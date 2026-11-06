---
id: predict-input
type: predict
title: Listening
concept: input-returns-text
code: |
  count = input("How many? ")
  print(count * 3)
inputs: ["2"]
question: "If you type `2`, what does this print?"
options:
  - text: "6"
    misconception: input-returns-number
    feedback: "`input()` always hands back a string. The text `\"2\"` times 3 is the text three times: `222`."
  - text: "222"
    correct: true
    feedback: "Right. `count` holds the string `\"2\"`, and a string times 3 is the same text three times."
  - text: An error
    misconception: str-times-int-errors
    error: TypeError
    feedback: "A string times a whole number is allowed in Python. It repeats the text: `\"2\"` three times is `222`."
  - text: "2 2 2"
    misconception: repetition-adds-space
    feedback: "Repeating a string doesn't put anything between the copies. `\"2\"` three times is `222`."
after: |
  Now press Run and type `2` yourself.
---
This asks a question, then prints the answer times 3. Think about what kind of value `input()` hands back.
