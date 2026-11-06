---
id: pips
type: pips
title: Fix Riya's version
files: [track.py, dp.py]
entry: dp.py
dialogue:
  - riya.neutral: "Can you look at mine? Something's off. Value iteration, max over everything, one line."
  - riya.confused: "It says the tile under the pool is worth 4.6. The crab loves it there."
dialogue_after:
  - riya.surprised: "I only planned for the moves that go right. The max is your choice. The sum is the luck."
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
Riya's value iteration is in `dp.py`; `track.py` is your grid from last week. Run it and look at the bottom row: the tile under the pool, `(2, 3)`, comes out at 4.6, as if it were the best place on the grid.

Fixed, every tile's value is the biggest of its actions' Q-values, each a sum over the outcomes weighted by their chances, and nothing comes after a step that ends the race.
