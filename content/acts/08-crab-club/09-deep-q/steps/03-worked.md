---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "The practice corridor again. Five tiles, and he only goes left or right."
  - moss: "A table, to keep the moving parts few. The two tricks are what matter."
code: |
  import numpy as np

  # The practice corridor: five tiles in a row, the finish at tile 4. No slips.
  FINISH = 4
  GAMMA = 0.9


  def walk(tile, move):
      return max(0, tile - 1) if move == 0 else tile + 1    # move 0 is left, 1 is right


  rng = np.random.default_rng(5)
  q = np.zeros((5, 2))            # a guess for every tile and move
  frozen = q.copy()
  memory = []
  moves = 0

  for race in range(60):
      epsilon = max(0.05, 1 - race / 40)
      tile = 0
      while tile != FINISH:
          if rng.random() < epsilon:
              move = int(rng.integers(2))
          else:
              move = int(np.argmax(q[tile]))
          after = walk(tile, move)
          reward = 10 if after == FINISH else -1
          memory.append((tile, move, reward, after))
          memory = memory[-200:]
          moves += 1

          picks = rng.choice(len(memory), size=min(8, len(memory)), replace=False)
          for i in picks:
              was, how, got, now = memory[i]
              target = got if now == FINISH else got + GAMMA * frozen[now].max()
              q[was, how] += 0.1 * (target - q[was, how])

          if moves % 20 == 0:
              frozen = q.copy()
          tile = after

  print("Worth going right:", np.round(q[:FINISH, 1], 2))
subgoals:
  - label: The corridor and gamma
    lines: [3, 9]
  - label: Start knowing nothing, with a frozen copy and an empty memory
    lines: [12, 16]
  - label: Explore less as he learns
    lines: [19, 25]
  - label: Remember every move
    lines: [26, 30]
  - label: Pick a batch at random, not in order
    lines: [32, 32]
  - label: Work out the targets with the frozen copy
    lines: [33, 35]
  - label: Nudge the guesses for the moves taken
    lines: [36, 36]
  - label: Refresh the frozen copy now and then
    lines: [38, 39]
explain:
  prompt: "Why does Moss pick a batch at random from `memory`, instead of learning from the last eight moves in order?"
  answer: "The last eight moves are nearly the same eight moves: one stretch of corridor, a few tiles. Learning from them in order drags the guesses towards whatever happened lately and lets the rest drift. A random batch mixes early and late, near and far, so each step learns a little about everything, and every memory gets used many times instead of once."
  concept: dqn
---
The **replay buffer** is `memory`: every move, kept, the oldest dropped after 200. Each move, he learns from eight memories picked at random. The **frozen copy** is `frozen`: the targets come from it, and it only catches up every 20 moves, so the targets hold still in between.

With a table, line 36 is one gradient step on the squared gap. In your Make the same subgoals drive a network.
