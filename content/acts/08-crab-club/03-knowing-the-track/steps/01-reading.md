---
id: worth
type: reading
title: What a tile is worth
dialogue:
  - moss: "Last week you raced a thousand times to find out what a line was worth."
  - moss: "You know every tile and every chance. You can work it out instead."
---
The **value** of a tile, under a policy, is the return Sir Reginald can expect from there, following that policy to the end of the race. Call it `V[tile]`.

Values hang together. A tile's value is what its policy's action is worth: for each outcome, the reward plus `gamma` times the value of where it leads, weighted by its chance.

```python
V[tile] = sum(chance * (reward + gamma * V[after])
              for chance, after, reward, over in outcomes(tile, policy[tile]))
```

On the finish and in the pool the race is over, so nothing comes after: their values are 0, and an outcome that ends the race adds no `gamma * V[after]`.

That gives a way to find every value, called **policy evaluation**. Start them all at 0. Sweep through the tiles, setting each from its neighbours. Repeat until nothing changes.
