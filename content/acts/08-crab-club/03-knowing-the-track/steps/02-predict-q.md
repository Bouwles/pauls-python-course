---
id: predict-q
type: predict
title: One step from the finish
concept: policy-evaluation
code: |
  gamma = 0.9
  values = {(0, 2): 9.0, (1, 2): 5.0, (0, 3): 0.0}

  # Told right on (0, 2): (chance, next tile, reward, race over)
  outcomes = [(0.8, (0, 3), 10, True),     # onto the finish
              (0.1, (0, 2), -1, False),    # slips up, bumps the edge, stays put
              (0.1, (1, 2), -1, False)]    # slips down
  worth = 0
  for chance, after, reward, over in outcomes:
      future = 0 if over else gamma * values[after]
      worth += chance * (reward + future)
  print(round(worth, 2))
question: What does this print?
options:
  - text: "9.06"
    correct: true
    feedback: "Right. 0.8 × 10 for the finish, with nothing after it. Then 0.1 × (-1 + 0.9 × 9) for the bump and 0.1 × (-1 + 0.9 × 5) for the slip down: 8 + 0.71 + 0.35."
  - text: "16.26"
    misconception: terminal-has-value
    feedback: "That counts the finish twice, as if it had a value of 10 of its own after the reward. The race is over there, so line 10 adds no future: `over` is True."
  - text: "7.8"
    misconception: value-is-next-reward
    feedback: "That's only the next rewards: 8 - 0.1 - 0.1. The two steps that don't end the race also bring gamma times the value of where they land."
---
The tile left of the finish, told right. Work out each outcome's share, then add them.
