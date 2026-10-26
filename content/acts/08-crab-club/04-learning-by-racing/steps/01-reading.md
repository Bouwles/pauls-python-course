---
id: no-map
type: reading
title: Racing without the map
dialogue:
  - moss: "Last week you had every chance written down. On race day, nobody hands him the list."
code: |
  def step(tile, action, rng):
      """One step on the real grid: (where he ends up, the reward, whether the race is over)."""
---
In the Gridworld Solver, `outcomes` told you every place a step could lead and its chance. That's a **model** of the grid. Sir Reginald has no model. He has `step`: try a move, and find out where he landed, what it cost, and whether the race is over. One sample, never the list.

Learning from samples alone is called **model-free**. This Job learns what each tile is worth under the traditional line, from races alone, two ways:

- **Monte Carlo**: race to the end, then credit every tile he stood on with the return that followed it. Average those returns over many races.
- **Temporal difference (TD)**: don't wait. After every step, nudge the tile he just left towards the reward plus `gamma` times the next tile's current estimate.

Both should end up near last week's figures, which come from the map. That's how you'll know they work.
