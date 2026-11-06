---
id: predict-standard-library
type: predict
title: Sunday, and a bit
concept: standard-library
code: |
  import math
  from datetime import datetime

  sunday = datetime(2026, 3, 15, 9, 45)
  print(sunday.weekday(), sunday.hour, math.ceil(4.1))
question: What does this print?
options:
  - text: "6 9 5"
    correct: true
    feedback: "Monday is 0, so Sunday is 6. The hour is 9, minutes aside. `math.ceil` always rounds up, so 4.1 becomes 5."
  - text: "0 9 5"
    misconception: weekday-starts-sunday
    feedback: "`weekday()` starts the week on Monday, as 0. Sunday is the last day, 6."
  - text: "7 9 5"
    misconception: weekday-starts-sunday
    feedback: "`weekday()` counts from 0, like positions in a list. Monday is 0, so Sunday is 6."
  - text: "6 9 4"
    misconception: ceil-rounds-nearest
    feedback: "`math.ceil` doesn't round to the nearest. It always rounds up, so anything over 4 becomes 5."
---
The Sunday after Caitlin's Saturday, at a quarter to ten.
