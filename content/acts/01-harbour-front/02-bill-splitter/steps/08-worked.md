---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul: "The Clocktower's floors share the cost of new cable. Same shape of problem, different bill."
code: |
  # Cable for the Clocktower, shared between the floors that use it
  metres = input("Metres of cable? ")
  floors = input("Floors sharing it? ")

  metres = float(metres)
  floors = int(floors)

  cost = metres * 1.20
  each = cost / floors

  print(f"Cable: {cost:.2f}")
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
The cable costs 1.20 a metre. Run it with `4.5` and `2`: each floor pays 2.70. Without the f-string, Python would say 2.6999999999999997.

Notice the names. `each` says what it holds; `x` wouldn't. The sums stay as floats right to the end, and only the f-strings round, so no penny is lost on the way.

The labels in the margin are Paul's steps. They're in your starter file for the Make.
