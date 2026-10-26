---
id: two-labels
type: concept
title: Two labels, one box
widget: two-labels
concept: list-aliasing
dialogue:
  - moss: "Labels on boxes. With numbers it never mattered. With lists it does."
---
A variable is a label on a box. `b = a` doesn't build a second box. It sticks a second label on the same one.

With a number that never matters. With a list it does: change the box through `b` and `a` shows the change, because there is only one box.

`b = a.copy()` builds a second box with the same things in it. So does `b = sorted(a)`, which also puts them in order.

Try both, then watch what each name shows.
