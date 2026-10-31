---
id: predict
type: predict
title: Stopped or finished
concept: gymnasium
dialogue:
  - neil: "My kettle, in Gymnasium's shape. The whole Studio's tea depends on it."
code: |
  class Kettle:
      """Neil's kettle, in Gymnasium's shape. It's done at 100 degrees. Neil waits three steps."""

      def reset(self, seed=None, options=None):
          self.temperature = 30
          self.steps = 0
          return self.temperature, {}

      def step(self, action):
          self.temperature += 20
          self.steps += 1
          terminated = self.temperature >= 100
          truncated = not terminated and self.steps >= 3
          return self.temperature, 1.0, terminated, truncated, {}


  env = Kettle()
  observation, info = env.reset()
  while True:
      observation, reward, terminated, truncated, info = env.step(1)
      print(observation, terminated, truncated)
      if terminated or truncated:
          break
question: "What does this print?"
options:
  - text: |-
      50 False False
      70 False False
      90 False True
    correct: true
    feedback: "Right. After three steps the kettle is at 90: not boiled, so not terminated, but Neil has stopped waiting, so truncated. The loop ends on either."
  - text: |-
      50 False False
      70 False False
      90 True False
    misconception: truncated-is-terminated
    feedback: "The kettle didn't finish. It was stopped by the time limit. That's `truncated`. `terminated` is only for an episode that ended in its own right, here a boiled kettle."
  - text: |-
      50 False False
      70 False False
      90 False True
      110 True False
    misconception: loop-ignores-truncated
    feedback: "The loop checks `terminated or truncated`, so it stops at 90. A loop that only checked `terminated` would carry on, and on a gate that never floods, never stop."
  - text: A ValueError, on the line that calls step
    misconception: step-returns-four
    error: ValueError
    feedback: "`step` returns five things and the line unpacks five. Older versions of Gym returned four, with a single `done`; Gymnasium splits it in two."
---
A Gymnasium environment doesn't have to import Gymnasium to have its shape. This one is a plain class with `reset` and `step`.
