---
id: no-map
type: reading
title: Racing without the map
dialogue:
  - paul.thinking.think: "Last week you had every chance written down. On League night, nobody hands the crab the list."
code: |
  def step(tile, action, rng):
      """One step on the real grid: (where it ends up, the reward, whether the race is over)."""
---
In the Gridworld Solver, `outcomes` told you every place a step could lead and its chance. That's a **model** of the grid. The crab has no model. It has `step`: try a move, and find out where it landed, what it cost, and whether the race is over. One sample, never the list.

Learning from samples alone is called **model-free**. This Job learns what each tile is worth under the traditional line, from races alone, two ways:

- **Monte Carlo**: race to the end, then credit every tile it stood on with the return that followed it. Average those returns over many races.
- **Temporal difference (TD)**: don't wait. After every step, nudge the tile it just left towards the reward plus `gamma` times the next tile's current estimate.

Both should end up near last week's figures, which come from the map. That's how you'll know they work.
