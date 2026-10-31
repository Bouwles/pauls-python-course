---
id: pips
type: pips
title: Fix Riya's version
files: [track.py, dp.py]
entry: dp.py
dialogue:
  - riya: "Can you look at mine? Something's off. Value iteration, max over everything, one line."
  - riya: "It says the tile under the pool is worth 4.6. The crab loves it there."
dialogue_after:
  - riya: "I only planned for the moves that go right. The max is your choice. The sum is the luck."
hints:
  nudge: "You choose the action. Who chooses which outcome happens, and how should the value account for it?"
  plan:
    - Run it and compare the tile under the pool with what you'd expect
    - "For each action, add up chance times (reward plus gamma times where it leads)"
    - Leave out the future when the race is over
    - Take the max over the actions of those sums
  shape: |
    best = max(
        sum(___ * (reward + (0 if over else gamma * values[after]))
            for chance, after, reward, over in outcomes(tile, action))
        for action in ___
    )
---
Policy evaluation says what a given policy is worth. **Value iteration** finds the best a tile can be worth: the same sweep, but each tile takes the value of its *best* action, so every sweep improves the policy and the values together. The best policy is then whichever action has the biggest value.

Riya's version is in `dp.py`; `track.py` is your grid from last week. Run it and look at the bottom row. Then fix it.
