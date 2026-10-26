---
id: worked-table
type: worked
title: How Moss pays the ferry
dialogue:
  - moss: "Ferro's tokens come in ones, fours and sixes. Don't ask him why. He'll tell you."
code: |
  def fewest_tokens(fare, tokens):
      fewest = [0] + [None] * fare
      for amount in range(1, fare + 1):
          for token in tokens:
              if token <= amount and fewest[amount - token] is not None:
                  if fewest[amount] is None or fewest[amount - token] + 1 < fewest[amount]:
                      fewest[amount] = fewest[amount - token] + 1
      return fewest[fare]


  print(fewest_tokens(8, [1, 4, 6]))
  print(fewest_tokens(12, [1, 4, 6]))
  print(fewest_tokens(5, [4, 6]))
subgoals:
  - label: "A slot for every amount from 0 up; the smallest case is known: 0 needs nothing"
    lines: [2, 2]
  - label: Fill the amounts in order, smallest first
    lines: [3, 3]
  - label: Try each token as the last one in
    lines: [4, 5]
  - label: Keep it if it beats what's in the slot
    lines: [6, 7]
  - label: The answer is in the last slot
    lines: [8, 8]
explain:
  prompt: "Why does Moss fill the slots from 1 upwards, and not from the fare down?"
  answer: "Each slot is worked out from smaller amounts: the fewest for 8 comes from the fewest for 7, 4 and 2. Filling upwards means those slots are already done when they're needed."
  concept: dynamic-programming
---
A cache fills itself in whatever order the calls happen to ask. A **table** is the same answers filled in on purpose, smallest first, with a loop and no recursion at all.

`fewest[amount]` is the fewest tokens that make `amount`, or `None` if it can't be done. For each amount, Moss tries each token as the last one paid: then the rest is a smaller amount, already in the table.

Taking the biggest token first would pay 8 as 6, 1, 1. The table finds 4, 4.

Press Step through and watch the table fill along Mira's pigeonholes.
