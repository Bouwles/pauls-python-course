---
id: predict
type: predict
title: Receipts in a list
concept: nested-data
code: |
  expenses = [
      {"item": "snacks", "amount": 18.4},
      {"item": "train tickets", "amount": 60.0},
  ]
  total = 0
  for expense in expenses:
      total = total + expense["amount"]
  print(total)
question: What does this print?
options:
  - text: "78.4"
    correct: true
    feedback: "Each time round, `expense` is one whole dictionary, and `expense[\"amount\"]` reads the amount inside it."
  - text: "60.0"
    misconception: loop-keeps-last-only
    feedback: "`total = total + ...` adds to what `total` already holds. After the first receipt it's 18.4, and the train tickets are added on top."
  - text: A TypeError
    misconception: loop-gives-index
    error: TypeError
    feedback: "`for expense in expenses` hands you the items, not their positions. Each item here is a dictionary, so `expense[\"amount\"]` works."
---
Two receipts for the trip fund, added up.
