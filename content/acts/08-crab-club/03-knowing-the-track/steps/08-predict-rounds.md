---
id: predict-rounds
type: predict
title: A longer corridor
concept: policy-iteration
code: |
  # Tiles 0 to 4, then the finish, 5. Moves never slip.
  GAMMA = 0.9
  FINISH = 5


  def step(tile, action):
      after = max(tile - 1, 0) if action == "left" else tile + 1
      return after, (10 if after == FINISH else -1)


  def worth(values, tile, action):
      after, reward = step(tile, action)
      return reward + (0 if after == FINISH else GAMMA * values[after])


  def evaluate(policy):
      values = [0.0] * (FINISH + 1)
      for sweep in range(100):
          for tile in range(FINISH):
              values[tile] = worth(values, tile, policy[tile])
      return values


  def greedy(values):
      return [max(["left", "right"], key=lambda action: worth(values, tile, action)) for tile in range(FINISH)]


  policy = ["left"] * FINISH
  rounds = 0
  while True:
      rounds += 1
      better = greedy(evaluate(policy))
      if better == policy:
          break
      policy = better
  print(rounds, "rounds")
question: What does this print?
options:
  - text: "6 rounds"
    correct: true
    feedback: "Right. Each round, one more tile from the finish end learns to go right: five rounds for five tiles. The sixth finds nothing to change, and that's how the loop knows to stop."
  - text: "2 rounds"
    misconception: improvement-is-global
    feedback: "One round can't fix every tile. A tile only switches to right once the tile it leads to is already worth reaching, so the fix spreads back one tile a round."
  - text: "100 rounds"
    misconception: iteration-fixed-rounds
    feedback: "100 is the number of sweeps inside each evaluation. The rounds of policy iteration stop as soon as improving gives back the same policy."
---
The Learn step's corridor, with five tiles instead of three, and a counter for the rounds.
