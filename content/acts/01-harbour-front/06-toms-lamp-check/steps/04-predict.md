---
id: predict-trace
type: predict
title: Keeping count
concept: tracing-loops
code: |
  oil = 0
  for night in range(1, 4):
      oil = oil + night
  print(oil)
question: "Tom adds oil each night: 1 cup, then 2, then 3. What does this print?"
options:
  - text: "6"
    correct: true
    feedback: "Right. Pass by pass: `oil` is 1, then 3, then 6. Each pass adds the night's number to what was already there."
  - text: "3"
    misconception: loop-keeps-last-only
    feedback: "`oil = oil + night` keeps what was there and adds to it. Write it down pass by pass: 0 + 1, then 1 + 2, then 3 + 3."
  - text: |-
      1
      3
      6
    misconception: unindented-line-in-loop
    feedback: "Those are the right values along the way, but `print(oil)` isn't indented. It runs once, after the loop."
  - text: "10"
    misconception: range-includes-end
    feedback: "`range(1, 4)` is 1, 2 and 3. It stops before 4, so there's no fourth night to add."
after: |
  To see it pass by pass, put `print(night, oil)` inside the loop, indented, and run it.
---
To **trace** a loop, keep a small table on paper: one row per pass, one column per variable. Fill in each row as Python would.

Slow, yes. It's also how you find out what a loop really does.
