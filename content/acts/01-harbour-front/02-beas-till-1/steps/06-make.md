---
id: make
type: make
title: Make Bea's till
on_pass: { bea: "Ten sixty. Same as the back of my paper bag." }
hints:
  nudge: "The till only knows pence. How do you get whole pounds out of 1060, and what's left over?"
  plan:
    - Name the prices and the quantities (loaves and buns)
    - Work out the total in pence
    - Split it into pounds and pence
    - Show the results
  shape: |
    loaves = 3
    buns = 4
    bread_price = ___
    bun_price = ___
    total = ___
    pounds = total ___ 100
    pence = total ___ 100
    print(total)
    print(pounds, "pounds", pence, "pence")
---
Write Bea's till for the Ashbys' order: 3 loaves at 240 pence, 4 buns at 85 pence.

```
1060
10 pounds 60 pence
```

Use variables called `loaves` and `buns` for the quantities. The checks change them to try other orders, so the sums have to use the variables, not the numbers.
