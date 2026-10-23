---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Captain Ferro buys rope by the metre. Same shape of problem."
code: |
  metres = input("Metres of rope? ")
  metres = float(metres)
  cost = metres * 1.15
  print(f"That's {cost:.2f}, captain.")
inputs: ["2.5"]
subgoals:
  - label: Ask for the text
    lines: [1, 1]
  - label: Turn the text into a number
    lines: [2, 2]
  - label: Work out the answer
    lines: [3, 3]
  - label: Show it, rounded
    lines: [4, 4]
explain:
  prompt: "Why does Moss use `float` here and not `int`?"
  answer: "Rope comes in parts of a metre, like 2.5. `int` can't read \"2.5\"."
  concept: float-conversion
---
`float()` turns text into a number that can have a decimal point.

The `f` before the quotes makes an **f-string**: anything inside `{}` is worked out and dropped into the text. `:.2f` means "show two decimal places".
