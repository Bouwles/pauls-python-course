---
id: worth
type: learn
title: How good a tile is to stand on
concept: policy-evaluation
dialogue:
  - paul.neutral: "Last week you raced a thousand times to find out what a line was worth."
  - paul.thinking.think: "You know every tile and every chance. You can work it out instead."
code: |
  gamma = 0.9
  values = {"A": 0.0, "B": 5.0, "C": -2.0}

  # Told right on A: 0.8 to B, 0.1 to C, 0.1 bumps and stays on A. Each step costs -1.
  outcomes = [(0.8, "B", -1), (0.1, "C", -1), (0.1, "A", -1)]
  worth = sum(chance * (reward + gamma * values[after]) for chance, after, reward in outcomes)
  print(round(worth, 2))
---
A tile's **value**, under a policy, is how good it is to stand on: the return the crab can expect from there, following the policy to the end of the race.

Values hang together. What an action is worth on a tile, its **Q-value**, comes from the tiles it can lead to. In words: for each way the move can go, its chance, times (the reward plus gamma times the value of where it lands). Add those up. A tile's value is its policy's action's Q-value.

The example works one out from three neighbours' values and prints `2.42`.

When a step ends the race, on the finish or in the pool, nothing comes after it: add only the reward, with no gamma times a value. The usual mistake is giving the finish a value of its own.
