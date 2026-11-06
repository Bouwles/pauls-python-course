---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.thinking: "The Workshop's glue pot. Minutes to melt, nine mornings. One of them is wrong, and I know why."
code: |
  import pandas as pd

  melt = pd.Series([12, 14, 13, 15, 12, 58, 14, 13, 16],
                   index=[f"{day} Feb" for day in range(1, 10)])

  q1 = melt.quantile(0.25)
  q3 = melt.quantile(0.75)

  middle_half = q3 - q1

  low = q1 - 1.5 * middle_half
  high = q3 + 1.5 * middle_half

  odd = melt[(melt < low) | (melt > high)]
  print(odd)

  without = melt.drop(odd.index)
  print(f"Mean {melt.mean():.1f}, or {without.mean():.1f} without it")
  print(f"Median {melt.median():.1f}, or {without.median():.1f} without it")
subgoals:
  - label: Find the quartiles
    lines: [6, 7]
  - label: Measure the middle half
    lines: [9, 9]
  - label: Set the fences, one and a half middles out
    lines: [11, 12]
  - label: Keep what falls outside
    lines: [14, 15]
  - label: Ask why before deleting anything
    lines: [17, 19]
explain:
  prompt: "Why does Paul build his fences from the quartiles, and not from the mean and the standard deviation?"
  answer: "The 58 drags the mean and the standard deviation towards itself, so fences built from them would move out to meet it. The quartiles come from the middle half of the mornings, which one bad morning hardly moves."
  concept: distributions
---
Paul's fences, on nine mornings of melting glue. `drop(labels)` gives a copy without those rows, so he can see what the odd one does to the mean and the median.

On 6 February the stove went out.

The labels beside the code are the steps he took. Your `fences` and `outliers` take the same steps, and they're in your file as comments.
