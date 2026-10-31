---
id: predict-trace
type: predict
title: Keeping count
concept: tracing-loops
code: |
  pages = 0
  for day in range(1, 4):
      pages = pages + day
  print(pages)
question: "Riya's cousin does 1 page of practice on the first day, then 2, then 3. What does this print?"
options:
  - text: "6"
    correct: true
    feedback: "Right. Pass by pass: `pages` is 1, then 3, then 6. Each pass adds the day's number to what was already there."
  - text: "3"
    misconception: loop-keeps-last-only
    feedback: "`pages = pages + day` keeps what was there and adds to it. Write it down pass by pass: 0 + 1, then 1 + 2, then 3 + 3."
  - text: |-
      1
      3
      6
    misconception: unindented-line-in-loop
    feedback: "Those are the right values along the way, but `print(pages)` isn't indented. It runs once, after the loop."
  - text: "10"
    misconception: range-includes-end
    feedback: "`range(1, 4)` is 1, 2 and 3. It stops before 4, so there's no fourth day to add."
after: |
  To see it pass by pass, put `print(day, pages)` inside the loop, indented, and run it.
---
To **trace** a loop, keep a small table on paper: one row per pass, one column per variable. Fill in each row as Python would.

Slow, yes. It's also how you find out what a loop really does, and the quiz score will need exactly this.
