---
id: pips
type: pips
title: Fix Riya's version
dialogue:
  - riya: "I did the standing orders for Neil. Paul wanted two extra buns. Once."
  - riya: "Now it's every week. I never wrote every week. Can you look?"
dialogue_after:
  - riya: "order = standing. Two labels, one book. I'd have sworn that was a copy."
hints:
  nudge: "After `order = standing`, how many dictionaries are there?"
  plan:
    - Find where order is made
    - Copy before you change
    - Change only the copy
    - Hand back the copy
  shape: |
    def todays_order(standing, extras):
        """Return today's order: the standing order plus this week's extras."""
        order = standing.___()
        for item, quantity in extras.items():
            order[item] = order.get(item, 0) + quantity
        return order
---
Run Riya's program. This week should have six buns; next week should be back to four.

Fix `todays_order` so it never changes the standing order it was given. These orders are flat, one level deep, so a shallow copy is enough here.
