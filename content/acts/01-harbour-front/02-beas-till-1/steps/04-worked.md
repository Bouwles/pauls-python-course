---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Mira's stamps. Same kind of sum, different shop."
code: |
  # Stamps for the parish newsletter
  first_class = 135
  second_class = 85
  first_count = 12
  second_count = 30

  total = first_class * first_count + second_class * second_count
  pounds = total // 100
  pence = total % 100

  print(total)
  print(pounds, "pounds", pence, "pence")
subgoals:
  - label: Name the prices and the quantities
    lines: [2, 5]
  - label: Work out the total in pence
    lines: [7, 7]
  - label: Split it into pounds and pence
    lines: [8, 9]
  - label: Show the results
    lines: [11, 12]
explain:
  prompt: "Why does line 8 use `//` and not `/`?"
  answer: "`/` would give 41.7, with the pence tangled up in the decimal. `//` gives the whole pounds, 41, and `%` gives the 70 pence left over."
  concept: arithmetic
---
Notice the names. `first_count` says what it holds; `x` wouldn't.

On the last line, `print` gets four things separated by commas. It prints them in a row with a space between each.
