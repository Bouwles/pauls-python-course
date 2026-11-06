---
id: make
type: make
title: Make the track known
files: [track.py, dp.py]
entry: dp.py
on_pass: { aaesha.proud: "Value iteration and policy iteration agree on every tile. Two methods, one answer." }
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
Write the five functions of the brief in `dp.py`. `track.py` has the grid, `outcomes`, `TRADITIONAL`, and `show_values` and `show_policy` for printing. Values and policies are dictionaries keyed by tile.

- `q_value`: one action's worth on one tile, from the Learn step.
- `evaluate`: Paul's sweep, with `q_value` for the policy's action.
- `greedy`: on every tile still racing, the action with the biggest `q_value`.
- `value_iteration`: as `evaluate`, but each tile takes its best Q-value.
- `policy_iteration`: evaluate, improve with `greedy`, repeat until the policy stops changing.

Done, it prints the three grids and the line from the brief, and policy iteration agrees with value iteration. The checks use Paul's own `track.py`, and compare your values and policies with his.

To watch it, put `draw(values, greedy(values, gamma))` at the end of each sweep in `value_iteration`.
