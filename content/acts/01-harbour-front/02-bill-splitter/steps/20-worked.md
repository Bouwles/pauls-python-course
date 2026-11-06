---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral: "The floors are sharing the cost of network cable for the servers. Same shape of problem, different bill."
code: |
  # Network cable for the Clocktower, shared between the floors that use it
  metres = input("Metres of cable? ")
  floors = input("Floors sharing it? ")

  metres = float(metres)
  floors = int(floors)

  total = metres * 1.20
  each = total / floors

  print(f"Cable: {total:.2f}")
  print(f"Each floor pays {each:.2f}")
inputs: ["4.5", "2"]
subgoals:
  - label: Ask for the text
    lines: [2, 3]
  - label: Turn the text into numbers
    lines: [5, 6]
  - label: Work out the answer
    lines: [8, 9]
  - label: Show it, rounded
    lines: [11, 12]
explain:
  prompt: "Why does Paul use `float` for the metres but `int` for the floors?"
  answer: "Cable comes in parts of a metre, like 4.5, and `int` can't read \"4.5\". Floors only come whole: nobody shares cable with half a floor."
  concept: float-conversion
---
A program with the same shape as the bill splitter. The floors are sharing the cost of network cable, at 1.20 a metre. With `4.5` metres and `2` floors, each floor pays 2.70. Without the `:.2f`, Python would show 2.6999999999999997.

Look at the names: `total` and `each` say what they hold, and your bill splitter uses the same two. The sums stay as floats to the end, and only the f-strings round, so no penny is lost on the way.

The four labels beside the code are Paul's steps. Your file for the Build starts with the same four, as comments.
