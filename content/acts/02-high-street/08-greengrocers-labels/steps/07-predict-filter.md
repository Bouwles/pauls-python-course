---
id: predict-filter
type: predict
title: The long answers
concept: conditional-comprehensions
code: |
  answers = ["time", "the piano", "6", "a quartet"]
  long_ones = [answer for answer in answers if len(answer) > 4]
  print(long_ones)
question: What does this print?
options:
  - text: "['time', 'the piano', '6', 'a quartet']"
    misconception: end-if-keeps-all
    feedback: "An `if` at the end decides which items get in at all. `time` and `6` are four characters or fewer, so they're left out."
  - text: "['the piano', 'a quartet']"
    correct: true
    feedback: "Only the answers longer than four characters pass. `time` has exactly four, and `4 > 4` is `False`."
  - text: "a quartet"
    misconception: comprehension-keeps-last
    feedback: "A comprehension collects every item that passes, in a new list. It doesn't stop at the last one."
---
Four answers from the Music round. Count the characters in each.
