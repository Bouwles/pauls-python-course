---
id: predict-lambda
type: predict
title: The slowest call
concept: sort-key
code: |
  calls = [("weigh", 0.02), ("look_up_price", 0.30), ("label", 0.01)]
  by_time = sorted(calls, key=lambda call: call[1], reverse=True)
  print(by_time[0])
question: What does this print?
options:
  - text: "('look_up_price', 0.3)"
    correct: true
    feedback: "Sorted by seconds, biggest first, so the dawdler leads. `sorted` hands back the whole tuples; the key only decides their order."
  - text: "0.3"
    misconception: key-returns-keys
    feedback: "The key decides the order, but `sorted` hands back the items themselves, whole tuples and all."
  - text: An error, because the lambda has no return
    misconception: lambda-needs-return
    error: SyntaxError
    feedback: "A lambda never has `return`. The value after the colon is what comes back."
---
Three calls from the till's log: the function's name, then the seconds it took.
