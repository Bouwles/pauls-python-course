---
id: two-jobs
type: reading
title: One acts, one judges
dialogue:
  - moss: "REINFORCE waits for the finish before it says anything. By then the third move is long gone."
  - moss: "Give him a critic. The committee have the experience."
---
REINFORCE learns once a race is over, from the whole return, and long races make noisy returns. **Actor-critic** learns after every move.

The **critic** keeps a value for every tile, learned by TD as in Learning by Racing. After each move it gives its verdict, the **TD error**:

```python
error = reward + gamma * values[after] - values[tile]    # no values[after] if the race is over
```

Positive means the move went better than the critic expected from that tile; negative, worse. It estimates the move's **advantage**: how much better it was than his usual from there.

The **actor** is last week's softmax policy. It takes the REINFORCE step with the error where the return used to be:

```python
values[tile] += critic_rate * error
theta += actor_rate * error * grad_log_chance(theta, tile, action)
```

The critic's value is the baseline now, and one real reward plus the critic's guess stands in for the rest of the race.
