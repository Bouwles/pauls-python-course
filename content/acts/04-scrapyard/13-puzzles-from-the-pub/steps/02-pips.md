---
id: pips
type: pips
title: Fix Yahya's version
dialogue:
  - yahya: "Can you look at mine? Six teams, every seating. I added a set, so checking who's seated is quick."
  - yahya: "It is quick. It says there's one way. I've seated them three different ways this month."
dialogue_after:
  - yahya: "So whatever you do on the way down, you undo on the way back. Even the bit for speed."
hints:
  nudge: "When Yahya stands a team up again with `row.pop()`, is it still in `seated`?"
  plan:
    - Find every change made before the recursive call
    - Undo each of them after the call, so the next team is tried from the same position
    - Check six teams with three rivalries give 216 seatings
  shape: |
    row.append(team)
    seated.add(team)
    total = total + seat()
    row.pop()
    seated.___(team)
---
Yahya's count is Paul's seating, changed to add up every seating instead of stopping at the first. A full row counts 1, and each table adds up what all its choices lead to. That part is right.

Run it. Then press Step through on three teams and watch `seated` as the tower of crates comes back down.

The checks count seatings for no rivals, for rivals that make seating impossible, and for one team on its own.
