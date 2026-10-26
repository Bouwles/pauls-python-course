"""The sea wall gate, as a Gymnasium environment.

The harbour sits behind the sea wall. The river runs into it, and the gate in
the wall lets water through, either way, whichever side is higher. Every
quarter of an hour the keeper may wind the gate down a notch, leave it, or
wind it up a notch. The harbour must stay between GROUND, where the boats sit
on the mud, and FLOOD, where the water comes over the quay.

The committee's rules, for one step:

1. The gate moves: action 0 winds it down a notch, 1 leaves it, 2 winds it up.
   It never goes below 0 (shut) or above NOTCHES (wide open).
2. The harbour gains RIVER, plus FLOW times the notches open (after the move)
   times (sea level minus harbour level), using the sea level before the step.
3. Time moves on a step, and the sea takes its new level:
   MEAN_TIDE + amplitude * sin(2 * pi * steps / PERIOD + phase) + swell,
   where swell is a fresh normal(0, 0.05) each step, clipped to -0.15..0.15.
4. The harbour is safe if GROUND <= harbour <= FLOOD. Safe: reward 1.0.
   Not safe: reward 0.0, and the episode is terminated.
   Safe at MAX_STEPS: the episode is truncated.

At reset: amplitude from uniform(1.2, 2.2), phase from uniform(0, 2 * pi),
harbour 3.0 + uniform(-0.2, 0.2), the gate at notch 2, steps at 0, and the
sea at its level for step 0. Draw every random number from self.np_random.

The observation is four float32 numbers: harbour level, sea level, the gate's
notch, and how far the sea rose since the last step (0 at reset).
"""

import math

import gymnasium as gym
import numpy as np
from gymnasium import spaces

MEAN_TIDE = 3.0   # metres: the sea halfway between high and low water
PERIOD = 50       # steps from one high water to the next; a step is a quarter of an hour
RIVER = 0.03      # metres the river adds to the harbour every step
FLOW = 0.04       # the share of the difference in level each open notch lets through per step
GROUND = 2.0      # below this, the boats are aground
FLOOD = 4.0       # above this, the quay floods
NOTCHES = 4       # the gate opens from 0, shut, to 4, wide open
MAX_STEPS = 200   # fifty hours: four tides

DOWN, LEAVE, UP = 0, 1, 2


class TideGateEnv(gym.Env):
    """Observation: harbour level, sea level, gate notch, and how far the sea rose since the last step."""

    metadata = {"render_modes": []}

    def __init__(self):
        # Say what the keeper sees and what he can do:
        # observation_space, a Box of four float32 numbers (levels 0 to 8 m, the notch 0 to 4,
        # the rise -1 to 1), and action_space, Discrete(3).
        raise NotImplementedError

    def reset(self, *, seed=None, options=None):
        super().reset(seed=seed)
        # Seed, then set the scene
        # Hand back the observation and an info dict
        raise NotImplementedError

    def step(self, action):
        # Apply the action
        # Let the world move
        # Was that safe? Reward, terminated, truncated
        # Hand back five things
        raise NotImplementedError
