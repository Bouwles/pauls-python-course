---
id: pips
type: pips
title: Fix Riya's version
dialogue:
  - riya.pleased: "I did the standing orders for Caitlin. Paul wanted two extra buns. Once."
  - riya.confused: "Now it's every week. I never wrote every week. Can you look?"
dialogue_after:
  - riya.surprised: "order = standing. Two labels, one book. I'd have sworn that was a copy."
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
Run Riya's program. This week should have six buns, and next week should be back to four.

Fix `todays_order` so it never changes the standing order it was given. These orders are flat, one level deep, so `.copy()` is enough here.
