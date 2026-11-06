---
id: make
type: make
title: Make it learn by racing
files: [track.py, dp.py, learn.py]
entry: learn.py
timeout_ms: 30000
on_pass: { aaesha.pleased: "The races agree with the map, within the wobble. That's how I know it learned." }
hints:
  nudge: "Monte Carlo and TD both start every tile at 0.0 and change it from races. What does each one move a tile towards, and when?"
  plan:
    - "episode: race once, keeping (tile, action, reward) at each step, until the race is over or the limit"
    - "returns_from: walk back from the end, total = reward + gamma * total"
    - "mc_evaluate: race from random_start, then every visit is one more sample for the running average"
    - "td_update: the target is the reward, plus gamma times the next tile's worth unless the race is over"
    - "td_evaluate: after every step, td_update the tile it left, then move it on"
    - Print the map's values, then each learner's values and how far they are from the map
  shape: |
    def mc_evaluate(policy, races, rng, gamma=0.9):
        values = {tile: 0.0 for tile in TILES}
        visits = {tile: 0 for tile in TILES}
        for race in range(races):
            steps = episode(policy, rng, ___)
            rewards = [reward for _, _, reward in steps]
            for (tile, _, _), sample in zip(steps, ___):
                visits[tile] += 1
                values[tile] += (___ - values[tile]) / visits[tile]
        return values


    def td_update(values, tile, reward, after, over, alpha=0.1, gamma=0.9):
        target = reward + (0 if over else ___)
        error = target - values[tile]
        values[tile] += ___
        return error
---
Write the five functions of the brief in `learn.py`. `track.py` is Paul's grid, now with `step`, `random_start` and `RACING`; `dp.py` is your work from last week. Nothing in `learn.py` may call `outcomes`: the crab learns from `step` alone.

- `episode` and `returns_from`: one race, and the backwards trick.
- `mc_evaluate`: Paul's Monte Carlo loop, each race starting from `random_start(rng)` so every tile gets visited.
- `td_update`: one TD step, from the Learn step. It returns the TD error.
- `td_evaluate`: after every step, update the tile it left, then move on.

Done, it prints the three grids from the brief, each learner near the map. The learned values are close, never equal: the checks race thousands of times with a seeded `rng` and allow for that. On a copy of the grid where the crab never slips, both must hit the map exactly.

To watch, call `draw(values, policy)` every hundred races.
