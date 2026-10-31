---
id: predict-targets
type: predict
title: What the move should have been worth
concept: dqn
code: |
  import numpy as np

  gamma = 0.9
  # The network's four Q-values (up, down, left, right) on the tile each move led to
  after_q = np.array([[2.0, 5.0, 1.0, 3.0],    # beside the finish
                      [4.0, 4.0, 4.0, 4.0]])   # on the finish
  rewards = np.array([-1.0, 10.0])
  overs = np.array([0.0, 1.0])                 # 1.0: that move ended the race
  actions = np.array([3, 3])                   # both moves were right

  targets = rewards + gamma * after_q.max(axis=1) * (1 - overs)
  print(targets.tolist())
question: "Two memories. What are their targets?"
options:
  - text: "[3.5, 10.0]"
    correct: true
    feedback: "Right. The first move cost -1 and led to a tile whose best move is worth 5.0, so -1 + 0.9 × 5.0. The second ended the race: `1 - over` is 0, so the target is the reward alone, whatever the network thinks of the finish tile."
  - text: "[3.5, 13.6]"
    misconception: td-terminal-bootstrap
    feedback: "Once the crab is on the finish there's nothing left to be worth anything. `(1 - over)` is 0 for that move, so the 4.0s are ignored. The network never gets a target for the finish tile, which is why its guesses there are nonsense."
  - text: "[1.7, 10.0]"
    misconception: q-target-same-action
    feedback: "The target asks what the next tile is worth if the crab plays it well from there: its best Q-value, `max`, which is 5.0. Which move got the crab there doesn't come into it."
---
Two memories, and the network's opinion of where each move led. `axis=1` takes the biggest of each row's four.
