---
id: preferences
type: reading
title: Preferences, not values
dialogue:
  - committee: "Values. Q-values. Targets. Frozen copies."
  - committee: "Sir Reginald does not value tiles. He..."
  - committee: "...goes somewhere."
  - moss: "Then learn where he goes, and skip the worth."
---
Deep Q learns what each move is worth, then picks the biggest. **Policy gradients** skip the worth and learn the choosing itself.

Sir Reginald keeps four **preferences** for every tile, in `theta`, shape `(3, 4, 4)`. The **softmax** turns a tile's four into chances: `exp` of each, divided by their total. A bigger preference means a bigger chance, but never certainty, so he goes on exploring by himself until the preferences are far apart.

**REINFORCE** nudges the preferences after every race. For each move, take the return from that move to the end of the race, and step `theta` along the gradient of the log of that move's chance, times the return:

```python
theta += rate * ret * grad_log_chance(theta, tile, action)
```

For a softmax, that gradient is zero everywhere but the tile itself, where it is 1 for the move he made, minus the chances. A big return makes the move more likely; a poor one, less.
