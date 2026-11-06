---
id: predict-table
type: predict
title: Fewest coins
concept: dynamic-programming
code: |
  fewest = [0] * 6
  for amount in range(1, 6):
      fewest[amount] = fewest[amount - 1] + 1
      if amount >= 3 and fewest[amount - 3] + 1 < fewest[amount]:
          fewest[amount] = fewest[amount - 3] + 1
  print(fewest)
question: What does this print?
options:
  - text: "[0, 1, 2, 1, 2, 3]"
    correct: true
    feedback: "Right. 3p is one 3p coin. 4p is the fewest for 1p plus one more coin, 2. 5p is the fewest for 2p plus a 3p, 3 coins."
  - text: "[0, 1, 2, 3, 4, 5]"
    misconception: dp-ignores-better
    feedback: "Each slot starts as one more than the slot before, but the `if` replaces it when a 3p coin does better. From 3p on, it does."
---
The fewest coins to make each amount from 0p to 5p, with 1p and 3p coins.
