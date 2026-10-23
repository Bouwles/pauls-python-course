---
id: make
type: make
title: Make the list fixer
on_pass: { bea: "Five on the form, and flour still first on mine. I counted twice." }
hints:
  nudge: "Which list has to stay in Bea's order, and which lists are new ones made from it?"
  plan:
    - Remove the repeats, keeping the first of each
    - Take out what doesn't apply
    - Sort a copy, not the original
    - Slice off the part you need
    - Show each list, one item per line
  shape: |
    order = []
    for item in shopping:
        if item ___ order:
            order.append(item)
    for item in in_stock:
        if item in order:
            order.___(item)
    order_form = ___(order)
    urgent = order[___]
    print("Order form:")
    for item in order_form:
        print(item)
    print("If the van is small:")
    ___
---
Write Bea's list fixer. With the lists in the file it prints:

```
Order form:
butter
eggs
flour
raisins
yeast
If the van is small:
flour
yeast
butter
```

Keep `shopping` and `in_stock` at the top. The checks swap in other lists, so work from the lists, not from the words in them.

The comments are Moss's subgoals from Mira's round.
