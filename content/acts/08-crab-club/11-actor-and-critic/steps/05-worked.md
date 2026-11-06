---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral.point: "The practice corridor, one more time. Four tiles, two moves, and a critic."
code: |
  import numpy as np

  # The practice corridor: tiles 0 to 3, the finish at 4. Move 0 is left, 1 is right. No slips.
  FINISH = 4
  GAMMA = 0.9

  rng = np.random.default_rng(2)
  prefs = np.zeros((FINISH, 2))        # the actor: two preferences on every tile
  values = np.zeros(FINISH + 1)        # the critic: an opinion of every tile

  for race in range(100):
      tile = 0
      for move in range(30):
          chances = np.exp(prefs[tile] - prefs[tile].max())
          chances = chances / chances.sum()
          action = rng.choice(2, p=chances)
          after = max(0, tile - 1) if action == 0 else tile + 1
          reward = 10 if after == FINISH else -1
          over = after == FINISH

          error = reward + (0 if over else GAMMA * values[after]) - values[tile]
          grad = np.eye(2)[action] - chances
          values[tile] += 0.2 * error
          prefs[tile] += 0.2 * error * grad
          tile = after
          if over:
              break

  right = np.exp(prefs[:, 1]) / np.exp(prefs).sum(axis=1)
  print("Chance of going right:", right.round(2))
  print("The critic's values:", values[:FINISH].round(1))
subgoals:
  - label: The corridor and gamma
    lines: [3, 5]
  - label: Start with no preferences and no opinions
    lines: [7, 9]
  - label: "Pick by chance, and take the move"
    lines: [13, 19]
  - label: The critic's verdict, and which way makes this move likelier, before anything changes
    lines: [21, 22]
  - label: The critic learns what the tile is worth
    lines: [23, 23]
  - label: The actor makes the move likelier if it beat the critic's expectation
    lines: [24, 24]
  - label: Move on, until the race is over
    lines: [25, 27]
  - label: Report what was learned
    lines: [29, 31]
explain:
  prompt: "Line 21 works out the verdict and line 22 the gradient before line 23 changes the critic's value. What would go wrong if the critic learned first?"
  answer: "The actor would be judged by a critic that had already moved towards this very move's result, so the verdict it used would be smaller than the one that was really earned. Work out the verdict and the gradient first, from the opinions and chances as they stood when the move was made, then let both learn."
  concept: actor-critic
---
Actor-critic on a practice corridor, like the one in the Gridworld Solver. Every move is judged as soon as it's made, and both parts learn from the same verdict.

Run it. After 100 races the actor goes right nearly every time, and the critic's values are what policy evaluation would work out with the map: 10, 8, 6.2 and 4.6, counting back from the finish.

The labels beside the code are Paul's steps. Your `update` and `train` start with the same ones, as comments.
