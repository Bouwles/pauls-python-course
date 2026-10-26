"""The sea wall gate, as a Gymnasium environment.

The harbour sits behind the sea wall. The river runs into it, and the gate in
the wall lets water through, either way, whichever side is higher. Every
quarter of an hour the keeper may wind the gate down a notch, leave it, or
wind it up a notch. The harbour must stay between GROUND, where the boats sit
on the mud, and FLOOD, where the water comes over the quay.
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
        self.observation_space = spaces.Box(
            low=np.array([0.0, 0.0, 0.0, -1.0], dtype=np.float32),
            high=np.array([8.0, 8.0, float(NOTCHES), 1.0], dtype=np.float32),
            dtype=np.float32,
        )
        self.action_space = spaces.Discrete(3)

    def reset(self, *, seed=None, options=None):
        super().reset(seed=seed)
        self.amplitude = float(self.np_random.uniform(1.2, 2.2))     # neap tides to spring tides
        self.phase = float(self.np_random.uniform(0.0, 2 * math.pi))
        self.harbour = 3.0 + float(self.np_random.uniform(-0.2, 0.2))
        self.gate = 2
        self.steps = 0
        self.sea = self._sea_level()
        self.previous_sea = self.sea
        return self._observation(), {}

    def step(self, action):
        self.gate = min(max(self.gate + int(action) - 1, 0), NOTCHES)
        self.harbour += RIVER + FLOW * self.gate * (self.sea - self.harbour)
        self.steps += 1
        self.previous_sea, self.sea = self.sea, self._sea_level()
        safe = GROUND <= self.harbour <= FLOOD
        terminated = not safe
        truncated = safe and self.steps >= MAX_STEPS
        reward = 1.0 if safe else 0.0
        return self._observation(), reward, terminated, truncated, {}

    def _sea_level(self):
        """The tide at this step, plus a little swell."""
        swell = float(np.clip(self.np_random.normal(0.0, 0.05), -0.15, 0.15))
        return MEAN_TIDE + self.amplitude * math.sin(2 * math.pi * self.steps / PERIOD + self.phase) + swell

    def _observation(self):
        return np.array([self.harbour, self.sea, self.gate, self.sea - self.previous_sea], dtype=np.float32)
