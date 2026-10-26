---
id: make
type: make
title: Make the track known
files: [track.py, dp.py]
entry: dp.py
on_pass: { committee: "Forty years. The bottom row was never the line. We shall write to the newsletter." }
hints:
  nudge: "evaluate, value_iteration and greedy all need the same thing: what one action is worth on one tile. Which function gives that?"
  plan:
    - "q_value: add up chance times (reward plus gamma times where it leads), nothing after the end of a race"
    - "evaluate: start at nothing, sweep with the policy's action, stop when the biggest change is under theta"
    - "greedy: on each tile still racing, the action with the biggest q_value"
    - "value_iteration: as evaluate, but each tile takes its best action's worth"
    - "policy_iteration: evaluate, take greedy, stop when greedy gives back the same policy"
    - Print the traditional line's values, the best values and the best line
  shape: |
    def evaluate(policy, gamma=0.9, theta=1e-6):
        values = {tile: 0.0 for tile in TILES}
        while True:
            biggest_change = 0
            for tile in TILES:
                if is_over(tile):
                    continue
                new = q_value(values, tile, ___, gamma)
                biggest_change = max(biggest_change, ___)
                values[tile] = new
            if biggest_change < theta:
                return values


    def policy_iteration(policy, gamma=0.9):
        while True:
            values = evaluate(___, gamma)
            better = greedy(___, gamma)
            if better == policy:
                return policy, values
            policy = ___
---
Write `dp.py`. `track.py` has the grid, `outcomes`, `TRADITIONAL`, and `show_values` and `show_policy` for printing.

**Policy iteration** is the other road to the best line. Evaluate a policy, then improve it: on every tile, take the greedy action on those values. Evaluate the new policy, improve again, and stop when improving changes nothing.

Put `draw(values, greedy(values, gamma), title=f"sweep {sweep}")` at the end of each sweep in `value_iteration` and press Run: the output panel plays the values spreading back from the finish, with the best arrows so far. Pass `q=` too, a dictionary from each tile to its four `q_value`s, and pointing at a tile shows them. The checks ignore drawings.

The checks use Moss's own `track.py`, so changing yours won't upset them.
