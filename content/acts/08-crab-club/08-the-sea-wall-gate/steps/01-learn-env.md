---
id: gymnasium
type: learn
title: One shape for every world
concept: gymnasium
dialogue:
  - paul.neutral: "Every learner so far has needed its own grid code. Gymnasium is an agreement about the shape."
  - paul.pleased.point: "Write the world in that shape once, and any agent can practise on it."
code: |
  class Kettle:
      """The Studio kettle, in Gymnasium's shape. It boils at 100 degrees."""

      def reset(self, seed=None, options=None):
          self.temperature = 20
          return self.temperature, {}

      def step(self, action):
          if action == 1:                  # 1 is "heat", 0 is "wait"
              self.temperature += 30
          terminated = self.temperature >= 100
          return self.temperature, -1.0, terminated, False, {}


  env = Kettle()
  observation, info = env.reset()
  while True:
      observation, reward, terminated, truncated, info = env.step(1)
      print(observation, reward, terminated, truncated)
      if terminated or truncated:
          break
---
The world an agent practises in is its **environment**. **Gymnasium** is the Python library most people use for them, and every Gymnasium environment has the same two methods:

- `reset()` starts an episode, one race or one game, and returns what the agent sees, its **observation**, and a dictionary of extras, `info`.
- `step(action)` does one action and returns five things: the observation, the reward, `terminated`, `truncated` and `info`.

The loop at the bottom is the one every agent runs: reset, then step until the episode is over.

Gymnasium doesn't run in the workshop, but its shape does. The example is a plain class with the two methods. It prints `50 -1.0 False False`, then 80, then `110 -1.0 True False`: boiled.
