---
id: grid
type: learn
title: Tiles, moves and rewards
concept: mdps
dialogue:
  - neil.thinking.point: "Twelve tiles. One rock. One pool. Everyone races the same line."
code: |
  TRACK = ["...F",
           ".#.P",
           "S..."]
  REWARDS = {"F": 10, "P": -10}   # every other tile costs -1

  for tile in [(2, 1), (0, 3), (1, 3)]:
      row, col = tile
      mark = TRACK[row][col]
      print(tile, mark, REWARDS.get(mark, -1))
---
```text
...F    F  the finish: +10, and the race is over
.#.P    #  a rock: nothing goes through it
S...    P  the rock pool: -10, and the race is over
        S  the start. Every other tile costs -1.
```

A bandit had choices but no places. The crab's grid has places, so it's a **Markov decision process** (MDP). Its parts:

- **States**: where the agent is. Here, a tile, as a `(row, column)` pair. The start is `(2, 0)`.
- **Actions**: what it can be told: up, down, left or right.
- **Rewards**: what each step is worth: +10 onto the finish, -10 into the pool, -1 anywhere else, so dawdling costs.

A race ends on the finish or in the pool. The example looks up three tiles' rewards and prints `(2, 1) . -1`, then the finish's 10 and the pool's -10.
