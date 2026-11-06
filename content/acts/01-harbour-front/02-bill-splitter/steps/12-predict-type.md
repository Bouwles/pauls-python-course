---
id: predict-type
type: predict
title: What type is a division?
concept: type-function
code: |
  print(type(6 / 2))
question: What does this print?
options:
  - text: "<class 'int'>"
    misconception: division-gives-whole-number
    feedback: "`6 / 2` is `3.0`, not `3`. `/` always gives a float, even when it divides exactly."
  - text: "<class 'float'>"
    correct: true
    feedback: "Right. `/` always gives a float, so `6 / 2` is `3.0`. `6 // 2` would give the int `3`."
  - text: "3.0"
    misconception: type-is-the-value
    feedback: "`type()` doesn't give back the value. It tells you what kind of value it is."
---
Python works out the brackets from the inside: first `6 / 2`, then the type of the answer. Think back to what `/` always gives.
