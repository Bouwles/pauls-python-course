---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "How many ways to seat all six teams. I added a set, so checking who's seated is quick."
  - pip: "It is quick. It says there's one way. Gwen's done it differently every week since March."
dialogue_after:
  - pip: "So whatever you do on the way down, you undo on the way back. Even the bit for speed."
hints:
  nudge: "When Pip stands a team up again with `row.pop()`, is it still in `seated`?"
  plan:
    - Find every change made before the recursive call
    - Undo each of them after the call, so the next team is tried from the same position
    - Check six teams with three feuds give 216 seatings
  shape: |
    row.append(team)
    seated.add(team)
    total = total + seat()
    row.pop()
    seated.___(team)
---
Pip's count is Moss's seating, changed to add up every seating instead of stopping at the first. A full row counts 1, and each table adds up what all its choices lead to. That part is right.

Run it. Then press Step through on three teams and watch `seated` as the junk tower comes back down.

The checks count seatings for no feuds, for feuds that make seating impossible, and for one team on its own.
