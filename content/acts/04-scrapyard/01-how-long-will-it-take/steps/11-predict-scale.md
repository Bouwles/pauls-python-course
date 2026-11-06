---
id: predict-scale
type: predict
title: Three times the parts
concept: big-o
code: |
  n_now = 1000
  n_later = 3000
  print((n_later / n_now) ** 2)
question: "This is how much more work an O(n²) job does at 3,000 parts than at 1,000. What does it print?"
options:
  - text: "9.0"
    correct: true
    feedback: "Right. Three times the parts, squared: nine times the work. Neil's pairs check at 3,000 parts would take nine times as long as at 1,000."
  - text: "3.0"
    misconception: time-scales-linearly
    feedback: "That's the O(n) answer: divide the sizes and stop. O(n²) squares that, and 3 squared is 9."
  - text: "6.0"
    misconception: square-is-double
    feedback: "`** 2` squares a number: it multiplies it by itself. 3 times 3 is 9. Doubling would be `* 2`."
---
`**` raises a number to a power, so `x ** 2` is x squared.
