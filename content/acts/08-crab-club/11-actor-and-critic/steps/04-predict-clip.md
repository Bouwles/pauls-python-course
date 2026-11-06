---
id: predict-clip
type: predict
title: The clip
concept: actor-critic
code: |
  import numpy as np


  def clipped_objective(ratio, advantage, epsilon=0.2):
      return np.minimum(ratio * advantage, np.clip(ratio, 1 - epsilon, 1 + epsilon) * advantage)


  print(round(clipped_objective(0.5, 2.0), 2))     # a good move, now half as likely
  print(round(clipped_objective(0.5, -2.0), 2))    # a bad move, now half as likely
question: What does this print?
options:
  - text: |-
      1.0
      -1.6
    correct: true
    feedback: "Right. Good move: the plain 1.0 is smaller than the clipped 0.8 × 2 = 1.6, so 1.0, and the objective keeps pulling it back up. Bad move: the clipped -1.6 is smaller than -1.0, so -1.6, flat: making it rarer still earns nothing more, and the actor stops fleeing it."
  - text: |-
      1.6
      -1.6
    misconception: ppo-always-clips
    feedback: "The ratio 0.5 is outside 0.8 to 1.2, but the clipped value is only used when the min picks it. For the good move, the plain 1.0 is smaller."
  - text: |-
      1.0
      -1.0
    misconception: ppo-clip-ignored
    feedback: "That's ratio times advantage with no clip at all. For the bad move, the clipped value, 0.8 × -2 = -1.6, is smaller, and the min takes it."
  - text: |-
      1.6
      -1.0
    misconception: ppo-takes-max
    feedback: "Those are the bigger of each pair. PPO takes the smaller, the less flattering verdict."
---
Two moves from the same batch, each now half as likely as when it was raced: a ratio of 0.5. One was good, one bad. Work out both scores for each, then take the smaller.
