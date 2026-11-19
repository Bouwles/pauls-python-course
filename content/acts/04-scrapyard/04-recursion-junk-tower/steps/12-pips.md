---
id: pips
type: pips
title: Fix Caitlin's version
dialogue:
  - caitlin.pleased.wave: "Can you look at mine? It's a hoist counter for Neil's crates, and eight metres up is four pulls down."
  - caitlin.confused: "Give it seven metres and it thinks for ages before falling over, and seven's a perfectly good height."
dialogue_after:
  - caitlin.surprised: "Oh, it went straight past nought and never even noticed it was there."
hints:
  nudge: "From 7 m the basket goes 7, 5, 3, 1. What height does Caitlin's function try next, and does it ever reach the base case?"
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
Neil's crates go up the Clocktower's old hoist. It lowers its basket 2 m with each pull of the rope, and the basket stops when it reaches the ground.

Caitlin's base case is `height == 0`. Run it, and read the last line of the traceback. Then fix it: from 7 m the basket goes 7, 5, 3, 1, and the fourth pull puts it on the ground.
