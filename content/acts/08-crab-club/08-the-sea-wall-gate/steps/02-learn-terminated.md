---
id: learn-terminated
type: learn
title: Finished, or stopped
concept: gymnasium
code: |
  gamma = 0.9
  reward = -1.0
  best_next = 5.0   # the best Q-value on the tile the crab is standing on now

  for terminated, truncated in [(True, False), (False, True)]:
      target = reward + (0 if terminated else gamma * best_next)
      print(terminated, truncated, target)
---
An episode can end two ways, and `step` says which with two flags.

- `terminated` is True when it ended in its own right: the finish, the pool, a flooded quay. Nothing comes after.
- `truncated` is True when it was stopped from outside, usually by a time limit. The world would have gone on.

The loop stops on either: `if terminated or truncated`.

The difference matters to a learner. A race stopped at its move limit hasn't reached a dead end: the tile it's on is still worth what it's worth. So the Q-learning target leaves out the future only when `terminated`. The example prints `-1.0` for the finished episode and `3.5` for the stopped one.

The usual mistake is treating a time limit as a finish.
