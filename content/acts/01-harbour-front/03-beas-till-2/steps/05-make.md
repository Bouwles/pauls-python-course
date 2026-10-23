---
id: make
type: make
title: Make the till that asks
on_pass: { bea: "Three loaves, seven twenty. I checked it twice." }
hints:
  nudge: "What does `input()` give you, and what does multiplication need?"
  plan:
    - Ask for the text
    - Turn the text into a number
    - Choose the price
    - Work out the answer
    - Show it, rounded
  shape: |
    item = input("Item? ")
    qty = ___(input("How many? "))
    if item == ___:
        price = ___
    else:
        price = ___
    total = ___
    print(f"That's {___:.2f}, please.")
---
Write Bea's till from scratch. Bread is 2.40, a bun is 0.85.

```
Item? bread
How many? 3
That's 7.20, please.
```

The comments in the file are Moss's subgoals from the rope example. Use them.
