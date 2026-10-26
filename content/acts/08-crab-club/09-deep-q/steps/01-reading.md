---
id: rule-not-table
type: reading
title: A rule instead of a table
dialogue:
  - moss: "A table has a box for every tile. Fine for twelve tiles. Not for every tide and wind."
  - moss: "A network has one rule for all of them. It needs watching."
---
Q-learning keeps a table: one number for every tile and every move. **Deep Q** (DQN) keeps a network instead. In goes a tile, described by its **features**; out come four Q-values, one for each move.

Here a tile is seven numbers: a 1 for its row among three, a 1 for its column among four. Tiles in the same row share inputs, so what the network learns about one tile rubs off on its neighbours. A table can't do that.

Training is regression on targets. After a move, the target is what that move should have been worth:

```python
target = reward + gamma * best_q_after * (1 - over)
```

The loss is the squared gap between the target and the network's Q-value for the move he actually made. The other three moves have no target, so they get no blame.

Left like that, it wobbles, for two reasons. The next three steps deal with them.
