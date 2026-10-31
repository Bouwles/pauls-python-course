---
id: make
type: make
title: Make the racing grid
files: [track.py]
entry: track.py
on_pass: { yahya: "Your line beats the traditional one. I'm not putting that on the leaderboard yet." }
hints:
  nudge: "Told up, the crab can end up in three places. Which three, with what chances, and what is each worth?"
  plan:
    - "move: one step, unless it leaves the grid or hits the rock"
    - "outcomes: nothing after the end of a race; otherwise what it was told with 1 - slip, each way sideways with slip / 2"
    - "race: follow the policy, letting chance pick each outcome, until the race is over or the limit"
    - "discounted_return: backwards from the last reward"
    - "MY_LINE: keep it away from the pool, even when it slips"
    - Race each line 1000 times and print its average return
  shape: |
    def move(tile, direction):
        row, col = tile
        d_row, d_col = STEPS[direction]
        new_row, new_col = ___, ___
        if 0 <= new_row < len(TRACK) and 0 <= new_col < len(TRACK[0]) and TRACK[new_row][new_col] != "#":
            return ___
        return ___


    def outcomes(tile, action, slip=SLIP):
        if is_over(tile):
            return []
        result = []
        for chance, direction in [(1 - slip, action)] + [(slip / 2, side) for side in SIDEWAYS[action]]:
            after = ___
            result.append((chance, after, ___, ___))
        return result
---
The Arcade's grid, in `track.py`. The brief has the rules; the constants and three small helpers are already at the top.

A bump into the edge or the rock still costs -1: time passes. When two slips leave it in the same place, keep both outcomes. Their chances add up.

To watch a race, put `draw(policy, crab=tile, title="race")` inside the loop in `race`, race once, and press Run: the output panel plays the crab's race a step at a time. The checks ignore drawings.

The checks race thousands of times with a seeded `rng` and compare the averages with what Paul worked out on paper. They also work out exactly what `MY_LINE` is worth.
