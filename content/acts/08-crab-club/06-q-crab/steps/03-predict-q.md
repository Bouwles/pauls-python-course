---
id: predict-q
type: predict
title: One Q-learning update
concept: q-learning
dialogue:
  - aaesha.thinking.think: "The best it could do next, not what it happened to do. Remember that."
code: |
  Q = {
      (1, 2): {"up": 0.0, "down": -2.0, "left": -1.5, "right": -6.0},
      (0, 2): {"up": 5.0, "down": 3.0, "left": 4.0, "right": 9.0},
  }
  alpha, gamma = 0.5, 0.9

  # On (1, 2) the crab was told up, got -1, and landed on (0, 2).
  best_next = max(Q[(0, 2)].values())
  target = -1 + gamma * best_next
  Q[(1, 2)]["up"] += alpha * (target - Q[(1, 2)]["up"])
  print(round(Q[(1, 2)]["up"], 2))
question: What does this print?
options:
  - text: "3.55"
    correct: true
    feedback: "Right. The best move from (0, 2) is worth 9.0, so the target is -1 + 0.9 × 9.0 = 7.1, and alpha 0.5 takes Q half way there from 0.0."
  - text: "1.75"
    misconception: q-target-same-action
    feedback: "That uses (0, 2)'s value for up, the move it made last. Q-learning asks what the next tile is worth if the crab plays its best from there: the biggest of its four values, 9.0."
  - text: "1.86"
    misconception: q-target-average
    feedback: "That averages (0, 2)'s four values. Q-learning assumes the crab will take the best move next, so it uses the biggest, not the average."
  - text: "7.1"
    misconception: td-replaces-value
    feedback: "7.1 is the target. One step is one sample, and alpha 0.5 moves Q only half way towards it."
---
The crab was on `(1, 2)`, was told up, and landed on `(0, 2)`. Find the target first, then move half way towards it.
