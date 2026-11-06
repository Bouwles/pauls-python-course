---
id: learn-policy-iteration
type: learn
title: Evaluate, improve, repeat
concept: policy-iteration
code: |
  # A corridor of tiles 0, 1 and 2, then the finish, 3. Moves never slip.
  GAMMA = 0.9


  def step(tile, action):
      after = max(tile - 1, 0) if action == "left" else tile + 1
      return after, (10 if after == 3 else -1)


  def worth(values, tile, action):
      after, reward = step(tile, action)
      return reward + (0 if after == 3 else GAMMA * values[after])


  def evaluate(policy):
      values = [0.0, 0.0, 0.0, 0.0]
      for sweep in range(100):
          for tile in range(3):
              values[tile] = worth(values, tile, policy[tile])
      return values


  def greedy(values):
      return [max(["left", "right"], key=lambda action: worth(values, tile, action)) for tile in range(3)]


  policy = ["left", "left", "left"]
  while True:
      better = greedy(evaluate(policy))
      print(policy, "->", better)
      if better == policy:
          break
      policy = better
---
**Policy iteration** is a second road to the best policy. Start from any policy, then repeat two steps:

1. Evaluate it: the value of every tile under this policy.
2. Improve it: on every tile, take the greedy action on those values.

Stop when improving gives back the same policy. Nothing is left to improve, so it's the best.

The example starts with a crab that always goes left, the wrong way. Each round, one more tile learns to go right, starting next to the finish, and the fourth round changes nothing. It prints four lines, ending `['right', 'right', 'right'] -> ['right', 'right', 'right']`.

The usual mistake is expecting one round to fix every tile. A tile only learns to go right once the tile it leads to is worth reaching.
