---
id: predict-dates
type: predict
title: Which November
concept: standard-library
code: |
  from datetime import date

  days = [date(2026, 11, 22), date(2025, 11, 3), date(2026, 11, 3)]
  november = [day for day in days if day.month == 11]
  print(len(november))
question: What does this print?
options:
  - text: "2"
    misconception: month-without-year
    feedback: "`.month` is 11 for every November, last year's too, so all three pass. To find this November, check `day.year == 2026` as well."
  - text: "3"
    correct: true
    feedback: "All three are in a November, one of them a year earlier. This is the bug Caitlin's report must not have: check the year too."
---
Three days from Caitlin's made-up ledger.
