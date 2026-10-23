---
id: predict-edge
type: predict
title: Just past midnight
concept: edge-cases
code: |
  def to_clock(minutes):
      hours = minutes // 60
      mins = minutes % 60
      return f"{hours:02}:{mins:02}"


  print(to_clock(402))
  print(to_clock(1500))
question: What does this print?
options:
  - text: |-
      06:42
      25:00
    correct: true
    feedback: "Right. Nothing in the code knows a day has 24 hours. It works for every time you'd think to try, and goes wrong at the first tide after midnight."
  - text: |-
      06:42
      01:00
    misconception: code-knows-what-you-meant
    feedback: "Python does exactly the sums written down. 1500 // 60 is 25, and nothing wraps it round to 01."
  - text: 06:42, then a ValueError
    misconception: wrong-answers-crash
    error: ValueError
    feedback: "`25:00` is a perfectly good string to Python. Wrong answers don't crash, which is what makes edge cases dangerous."
---
`{hours:02}` pads a number to two digits: 6 becomes `06`.

An **edge case** is an input at the boundary of what a function handles: zero, empty, exactly on a limit, just past midnight. Most bugs live there, because it's where nobody looked.
