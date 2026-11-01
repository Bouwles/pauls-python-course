---
id: predict-free
type: predict
title: Free seconds
concept: value-iteration
dialogue:
  - caitlin.pleased.think: "Suppose I add a practice mode. No clock, and moves cost nothing."
  - yahya.unimpressed: "Then nobody would ever hurry. Hypothetically."
code: |
  TRACK = ["...F", ".#.P", "S..."]
  STEPS = {"up": (-1, 0), "down": (1, 0), "left": (0, -1), "right": (0, 1)}
  SIDEWAYS = {"up": "left right", "down": "left right", "left": "up down", "right": "up down"}
  STEP_REWARD = 0     # seconds are free
  GAMMA = 0.99        # and nobody is in a hurry


  def outcomes(tile, action):
      for chance, way in [(0.8, action)] + [(0.1, side) for side in SIDEWAYS[action].split()]:
          row, col = tile[0] + STEPS[way][0], tile[1] + STEPS[way][1]
          if not (0 <= row < 3 and 0 <= col < 4) or TRACK[row][col] == "#":
              row, col = tile
          letter = TRACK[row][col]
          yield chance, (row, col), {"F": 10, "P": -10}.get(letter, STEP_REWARD), letter in "FP"


  def q_value(values, tile, action):
      return sum(chance * (reward + (0 if over else GAMMA * values[after]))
                 for chance, after, reward, over in outcomes(tile, action))


  racing = [(row, col) for row in range(3) for col in range(4) if TRACK[row][col] in ".S"]
  values = {(row, col): 0.0 for row in range(3) for col in range(4)}
  for sweep in range(300):
      for tile in racing:
          values[tile] = max(q_value(values, tile, action) for action in STEPS)

  print(max(STEPS, key=lambda action: q_value(values, (1, 2), action)))
question: "The crab is on (1, 2): left of the rock pool, just below the tile next to the finish. Which way does the best policy send it?"
options:
  - text: up
    misconception: best-is-shortest
    feedback: "Up is the short way to the finish, but one time in ten it slips right, into the pool. On League night that risk is worth taking. With free seconds and no clock, there's no hurry, so why take it?"
  - text: left
    correct: true
    feedback: "Into the rock, on purpose. Bumping it is the one move with no way into the pool: eight times in ten it stays put, and the slips take it up or down. Waiting is free now, so the best policy dawdles safely until a slip carries it up."
  - text: down
    misconception: sideways-slips-ignored
    feedback: "Down heads away from the pool, but it can still slip sideways, and sideways to the right from (1, 2) is the pool. Only one move here can never end in it."
after: |
  Now set `STEP_REWARD = -1` and `GAMMA = 0.9`, as on League night, and run it again.
---
This is value iteration on the racing grid, squeezed into one file. The track is the same, but two things have changed: seconds are free, and there's no clock.

You don't need to trace it. Think about what the crab risks, and what waiting costs it now.
