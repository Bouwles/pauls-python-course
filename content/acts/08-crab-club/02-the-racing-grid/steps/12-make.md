---
id: make
type: make
title: Make the racing grid
files: [track.py]
entry: track.py
on_pass: { neil.proud.thumbs: "Your line beats the traditional one by nearly nine points. That's a racing line." }
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
Write the five pieces of the brief in `track.py`. The grid, the rewards and three helpers are already at the top.

- `move`: one step. Off the edge or into the rock, it stays put.
- `outcomes`: the transitions. Told an action, the crab goes that way with chance `1 - slip`, and each way sideways with `slip / 2`. On the finish or in the pool, nothing follows: `[]`. If two outcomes land on the same tile, keep both.
- `race`: Paul's `run`, on the grid. Stop when the race is over, or after `limit` steps.
- `discounted_return`: backwards from the last reward.
- `MY_LINE`: a policy that keeps away from the pool, even when it slips.

Done, it prints both lines and their average returns, as in the brief, and yours wins. The checks race thousands of times with a seeded `rng`.

To watch a race, put `draw(policy, crab=tile)` inside the loop in `race`.
