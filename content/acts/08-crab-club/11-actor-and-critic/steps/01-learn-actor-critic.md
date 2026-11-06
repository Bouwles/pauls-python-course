---
id: two-jobs
type: learn
title: One acts, one judges
concept: actor-critic
dialogue:
  - paul.thinking: "REINFORCE waits for the finish before it says anything. By then the third move is long gone."
  - paul.laughing: "Give the crab a critic. Yahya can show it how."
code: |
  import numpy as np

  gamma = 0.9
  values = {"here": 3.0, "there": 5.0}     # the critic's opinion of two tiles
  prefs = np.zeros(2)                      # the actor's preferences here: left, right
  chances = np.array([0.5, 0.5])

  # The crab went right, from here to there, and paid a point.
  error = -1 + gamma * values["there"] - values["here"]
  values["here"] += 0.2 * error                              # the critic learns
  prefs += 0.2 * error * (np.array([0.0, 1.0]) - chances)    # the actor learns
  print(round(error, 2), round(values["here"], 2), prefs.round(2))
---
REINFORCE learns only once a race is over. **Actor-critic** learns after every move, with two parts.

The **critic** keeps a value for every tile, learned by TD as in the Value Estimator. After each move it gives its verdict, the TD error: the reward, plus gamma times its value of where the crab landed, minus its value of where the crab was. Positive means the move went better than it expected. That estimates the move's **advantage**: how much better it was than usual from there.

The **actor** is the softmax policy from Policy Gradients. It takes the REINFORCE step with the critic's verdict where the return used to be.

The example's verdict is `0.5`, so the critic raises its opinion to `3.1`, and the actor makes right a little likelier.
