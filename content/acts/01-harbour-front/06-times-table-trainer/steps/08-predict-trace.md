---
id: predict-trace
type: predict
title: Keeping count
concept: tracing-loops
code: |
  answered = 0
  for day in range(1, 4):
      answered = answered + day
  print(answered)
question: "What does this print?"
options:
  - text: "6"
    correct: true
    feedback: "Right. Pass by pass: `answered` is 1, then 3, then 6. Each pass adds the day's number to what was already there."
  - text: "3"
    misconception: loop-keeps-last-only
    feedback: "`answered = answered + day` keeps what was there and adds to it. Write it down pass by pass: 0 + 1, then 1 + 2, then 3 + 3."
  - text: |-
      1
      3
      6
    misconception: unindented-line-in-loop
    feedback: "Those are the right values along the way, but `print(answered)` isn't indented. It runs once, after the loop."
  - text: "10"
    misconception: range-includes-end
    feedback: "`range(1, 4)` is 1, 2 and 3. It stops before 4, so there's no fourth day to add."
after: |
  To see it pass by pass, put `print(day, answered)` inside the loop, indented, and run it.
---
A volunteer answers 1 question on the first day, then 2, then 3. Trace `answered` pass by pass, on paper if it helps, before you pick.
