---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Crane counter. Eight metres up, four pulls down. Recursion, like the junk tower."
  - pip: "Seven metres and it thinks for ages, then falls over. Seven's a perfectly good height."
dialogue_after:
  - pip: "It walked straight past nought. Never even noticed it was there."
hints:
  nudge: "From 7 m the hook goes 7, 5, 3, 1. What height does Pip's function try next, and does it ever reach the base case?"
  plan:
    - Find the base case
    - Follow the heights down from 7 and see whether they ever meet it
    - Make the base case catch every height at or below the ground
  shape: |
    def pulls(height):
        if height ___ 0:
            return 0
        return 1 + pulls(height - 2)
---
Every recursive function needs a **base case**: an answer it gives straight away, without calling itself. Every call should bring the problem a step closer to one.

Each pull of Nell's crane lever lowers the hook 2 m, and the hook stops when it hits the ground. Pip's base case is `height == 0`. Run it, and read the last line of the traceback. Then fix it: from 7 m the hook goes 7, 5, 3, 1, and the fourth pull puts it on the ground.
