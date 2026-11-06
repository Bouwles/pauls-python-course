---
id: learn-table
type: learn
title: Fill a table, smallest first
concept: dynamic-programming
code: |
  price = 6
  ways = [1] + [0] * price
  for amount in range(1, price + 1):
      ways[amount] = ways[amount - 1]
      if amount >= 2:
          ways[amount] = ways[amount] + ways[amount - 2]
  print(ways)
---
A cache fills itself in whatever order the calls happen to ask. A **table** is the same answers filled in on purpose: a list with a slot for every smaller question, worked out smallest first, with a loop and no recursion at all.

This is the 1p-and-2p counting again. `ways[amount]` is the ways to pay `amount`, one coin at a time. `ways[0]` is 1: there's one way to pay nothing. Each slot after that is the slot one before plus the slot two before, and both are filled already.

The example prints `[1, 1, 2, 3, 5, 8, 13]`: 13 for 6p, as before, with each slot worked out once.

The usual slip is to fill the table in the wrong order. A slot can only use slots that are already done.
