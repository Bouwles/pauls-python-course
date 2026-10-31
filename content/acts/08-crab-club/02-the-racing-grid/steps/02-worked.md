---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul: "A level from Caitlin's platform game. Fewer tiles, bigger drops."
  - paul: "Take it steady or go full speed. The jumps decide the rest."
code: |
  import numpy as np

  STATES = ["start", "halfway", "flag", "pit"]
  ACTIONS = ["steady", "full speed"]
  OUTCOMES = {
      ("start", "steady"): [(1.0, "halfway", -1)],
      ("start", "full speed"): [(0.9, "halfway", -1), (0.1, "pit", -20)],
      ("halfway", "steady"): [(0.7, "flag", 5), (0.3, "halfway", -1)],
      ("halfway", "full speed"): [(0.8, "flag", 5), (0.2, "pit", -20)],
  }
  OVER = {"flag", "pit"}
  POLICY = {"start": "full speed", "halfway": "steady"}


  def run(policy, rng):
      state = "start"
      rewards = []
      while state not in OVER:
          possible = OUTCOMES[(state, policy[state])]
          chances = [chance for chance, _, _ in possible]
          pick = rng.choice(len(possible), p=chances)
          _, state, reward = possible[pick]
          rewards.append(reward)
      return rewards


  rng = np.random.default_rng(34)
  for attempt in range(4):
      print(run(POLICY, rng))
subgoals:
  - label: Name the states and the actions
    lines: [3, 4]
  - label: For each state and action, what can happen, with its chance and reward
    lines: [5, 10]
  - label: Mark where it ends
    lines: [11, 11]
  - label: "A policy: one action for every state"
    lines: [12, 12]
  - label: Follow the policy, letting chance pick each outcome
    lines: [15, 24]
  - label: Run a few
    lines: [27, 29]
explain:
  prompt: "Why is `POLICY` a dictionary from state to action, and not a list of actions like `[\"full speed\", \"steady\"]`?"
  answer: "Because the player can't know in advance where they'll be. Halfway they might wait one turn or five, and full speed might drop them in the pit. A list of actions assumes every jump goes as planned. A policy says what to do in whatever state you find yourself in."
  concept: mdps
---
Each list in `OUTCOMES` is every way things can go, as `(chance, next state, reward)`. The chances in each list add up to 1: something always happens.

`rng.choice(n, p=chances)` picks a number from `0` to `n - 1`, each with its own chance. That's the game deciding.

Run it a few times with different seeds. Same policy, different runs.
