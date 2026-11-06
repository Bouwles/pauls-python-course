---
id: ppo
type: learn
title: Change, but not too much
concept: actor-critic
dialogue:
  - neil.pleased.point: "The drone that beat the world's best racing pilots learned with something called PPO."
  - paul.thinking: "Then it's worth knowing what PPO is for, before anyone reaches for it."
code: |
  import numpy as np


  def clipped_objective(ratio, advantage, epsilon=0.2):
      plain = ratio * advantage
      clipped = np.clip(ratio, 1 - epsilon, 1 + epsilon) * advantage
      return np.minimum(plain, clipped)


  print(clipped_objective(1.0, 2.0))    # nothing has changed yet
  print(clipped_objective(1.5, 2.0))    # a good move, made much likelier
  print(clipped_objective(1.5, -2.0))   # a bad move, made much likelier
---
Learning from each batch of races only once is wasteful. But step too far on one batch and the policy may race so badly it never collects the races that would put it right.

**PPO**, proximal policy optimisation, takes several steps on one batch, and stops rewarding change past a limit. For each move it works out the **ratio**: the move's chance now, divided by its chance when the batch was raced. Then it takes the smaller of two scores: the ratio times the advantage, and the ratio clipped to between 0.8 and 1.2 (epsilon 0.2 either side of 1) times the advantage.

The example prints `2.0`, then `2.4`: past 1.2, making a good move likelier earns nothing more. Then `-3.0`: the smaller score keeps a bad move's full cost.

The usual mistake is using the clipped score whenever the ratio is out of range. The smaller score decides.
