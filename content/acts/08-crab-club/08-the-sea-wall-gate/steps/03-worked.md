---
id: worked
type: worked
title: How Paul would do it
language: text
dialogue:
  - paul.pleased: "Neil's camera drone, hovering in a crosswind. Gusts tip it; the motors push back."
  - paul.neutral: "This one needs Gymnasium itself, so it runs at home, not here. Read it for the shape."
code: |
  import gymnasium as gym
  import numpy as np
  from gymnasium import spaces


  class HoverEnv(gym.Env):
      """Keep Neil's drone level in a gusty crosswind. Past 8 degrees, it can't recover."""

      def __init__(self):
          self.observation_space = spaces.Box(
              low=np.array([-20.0, -10.0], dtype=np.float32),
              high=np.array([20.0, 10.0], dtype=np.float32),
              dtype=np.float32,
          )
          self.action_space = spaces.Discrete(3)   # 0 lean left, 1 hold, 2 lean right

      def reset(self, *, seed=None, options=None):
          super().reset(seed=seed)
          self.tilt = float(self.np_random.uniform(-1.0, 1.0))
          self.drift = 0.0
          self.seconds = 0
          return self._observation(), {}

      def step(self, action):
          self.drift += 0.4 * (int(action) - 1)
          gust = float(self.np_random.normal(0.0, 0.3))
          self.drift = 0.9 * self.drift + gust
          self.tilt += self.drift
          self.seconds += 1
          terminated = abs(self.tilt) > 8.0
          truncated = not terminated and self.seconds >= 120
          reward = 0.0 if terminated else 1.0
          return self._observation(), reward, terminated, truncated, {}

      def _observation(self):
          return np.array([self.tilt, self.drift], dtype=np.float32)


  env = HoverEnv()
  observation, info = env.reset(seed=4)
  level = 0.0
  while True:
      action = 0 if observation[0] + 2 * observation[1] > 0 else 2
      observation, reward, terminated, truncated, info = env.step(action)
      level += reward
      if terminated or truncated:
          break
  print(f"Level for {level:.0f} of 120 seconds")
subgoals:
  - label: Say what the agent sees and what it can do
    lines: [9, 15]
  - label: Seed, then set the scene
    lines: [17, 21]
  - label: Hand back the observation and an info dict
    lines: [22, 22]
  - label: Apply the action
    lines: [25, 25]
  - label: Let the world move
    lines: [26, 29]
  - label: "Was that safe? Reward, terminated, truncated"
    lines: [30, 32]
  - label: Hand back five things
    lines: [33, 33]
  - label: The loop every agent runs
    lines: [39, 48]
explain:
  prompt: "Line 26 draws the gusts from `self.np_random`, not from `np.random`. Why does that matter?"
  answer: "`super().reset(seed=seed)` on line 18 seeds `self.np_random`. Draw everything from it and the same seed gives the same gusts, the same tilts, the same episode: so tests can repeat a run exactly, and two controllers can be compared in the same wind. Draw from `np.random` and the seed changes nothing."
  concept: gymnasium
---
A Gymnasium environment is a class that inherits from `gym.Env`. `__init__` declares the two spaces; `reset` and `step` do the rest. Every random number comes from `self.np_random`, which `super().reset(seed=seed)` seeds.

The loop at the bottom is Neil's rule of thumb on the sticks: lean against the tilt, allowing for the drift. Doing nothing lasts about thirty seconds; this lasts the full two minutes.
