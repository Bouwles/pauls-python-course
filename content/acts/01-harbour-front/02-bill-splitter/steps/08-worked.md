---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Captain Ferro's boats share their rope. Same shape of problem, different quay."
code: |
  # Rope for the north quay, shared between the boats that use it
  metres = input("Metres of rope? ")
  boats = input("Boats sharing it? ")

  metres = float(metres)
  boats = int(boats)

  cost = metres * 1.20
  each = cost / boats

  print(f"Rope: {cost:.2f}")
  print(f"Each boat pays {each:.2f}")
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
  prompt: "Why does Moss use `float` for the metres but `int` for the boats?"
  answer: "Rope comes in parts of a metre, like 4.5, and `int` can't read \"4.5\". Boats only come whole: nobody shares rope with half a boat."
  concept: float-conversion
---
The rope costs 1.20 a metre. Run it with `4.5` and `2`: each boat pays 2.70. Without the f-string, Python would say 2.6999999999999997.

Notice the names. `each` says what it holds; `x` wouldn't. The sums stay as floats right to the end, and only the f-strings round, so no penny is lost on the way.

The labels in the margin are Moss's steps. They're in your starter file for the Make.
