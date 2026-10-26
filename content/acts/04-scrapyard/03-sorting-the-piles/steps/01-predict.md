---
id: predict
type: predict
title: One pass
concept: simple-sorts
dialogue:
  - nell: "That's how I'd do it. Find the lightest, put it at the front. Then the next."
code: |
  weights = [5, 2, 8, 1, 9]
  lightest = 0
  for position in range(1, len(weights)):
      if weights[position] < weights[lightest]:
          lightest = position
  weights[0], weights[lightest] = weights[lightest], weights[0]
  print(weights)
question: What does this print?
options:
  - text: "[1, 2, 8, 5, 9]"
    correct: true
    feedback: "Right. One pass finds the lightest, 1 kg in position 3, and swaps it with whatever was at the front. The 5 lands where the 1 was."
  - text: "[1, 2, 5, 8, 9]"
    misconception: one-pass-sorts
    feedback: "One pass puts one part in its place: the lightest, at the front. The rest are only moved if they were in the way. It takes a pass for each position."
  - text: "[1, 5, 2, 8, 9]"
    misconception: swap-shifts-along
    feedback: "A swap trades two places and leaves everything else where it was. The 5 goes to position 3, where the 1 came from; the 2 doesn't move."
  - text: An IndexError
    misconception: index-is-the-value
    error: IndexError
    feedback: "`lightest` holds a position, not a weight: 0, then 1, then 3. `weights[3]` is the 1 kg part, well inside the list."
after: |
  Run it, then press Step through and watch the bars: one walk along the pile to find the lightest, then one swap.
---
**Selection sort**: find the lightest part and swap it to the front. Then find the lightest of the rest and swap it into second place, and so on down the pile. This code is the first pass.

The step-through draws a list of numbers as Nell's piles, one bar per weight, so you can watch a sort happen.
