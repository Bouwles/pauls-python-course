---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Captain Ferro's crossing. Fewer tiles, more water."
  - moss: "He can take it steady or go full ahead. The sandbank decides the rest."
code: |
  import numpy as np

  STATES = ["quay", "mid-channel", "island", "aground"]
  ACTIONS = ["steady", "full ahead"]
  OUTCOMES = {
      ("quay", "steady"): [(1.0, "mid-channel", -1)],
      ("quay", "full ahead"): [(0.9, "mid-channel", -1), (0.1, "aground", -20)],
      ("mid-channel", "steady"): [(0.7, "island", 5), (0.3, "mid-channel", -1)],
      ("mid-channel", "full ahead"): [(0.8, "island", 5), (0.2, "aground", -20)],
  }
  OVER = {"island", "aground"}
  POLICY = {"quay": "full ahead", "mid-channel": "steady"}


  def crossing(policy, rng):
      state = "quay"
      rewards = []
      while state not in OVER:
          possible = OUTCOMES[(state, policy[state])]
          chances = [chance for chance, _, _ in possible]
          pick = rng.choice(len(possible), p=chances)
          _, state, reward = possible[pick]
          rewards.append(reward)
      return rewards


  rng = np.random.default_rng(34)
  for trip in range(4):
      print(crossing(POLICY, rng))
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
  prompt: "Why is `POLICY` a dictionary from state to action, and not a list of actions like `[\"full ahead\", \"steady\"]`?"
  answer: "Because Ferro can't know in advance where he'll be. Mid-channel he might wait one turn or five, and full ahead might put him aground. A list of actions assumes the sea does as it's told. A policy says what to do in whatever state he finds himself in."
  concept: mdps
---
Each list in `OUTCOMES` is every way things can go, as `(chance, next state, reward)`. The chances in each list add up to 1: something always happens.

`rng.choice(n, p=chances)` picks a number from `0` to `n - 1`, each with its own chance. That's the sea deciding.

Run it a few times with different seeds. Same policy, different crossings.
