---
id: predict
type: predict
title: Stopped or finished
concept: gymnasium
dialogue:
  - neil.pleased.point: "My kart's tyres, in Gymnasium's shape. Cold tyres don't grip, so you warm them first."
code: |
  class Tyres:
      """Neil's tyres, in Gymnasium's shape. Ready at 100 degrees. Neil allows three warm-up laps."""

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


  env = Tyres()
  observation, info = env.reset()
  while True:
      observation, reward, terminated, truncated, info = env.step(1)
      print(observation, terminated, truncated)
      if terminated or truncated:
          break
question: What does this print?
options:
  - text: |-
      50 False False
      70 False False
      90 False True
    correct: true
    feedback: "Right. After three laps the tyres are at 90: not ready, so not terminated, but the warm-up laps are used up, so truncated. The loop ends on either."
  - text: |-
      50 False False
      70 False False
      90 True False
    misconception: truncated-is-terminated
    feedback: "The tyres never reached 100. They were stopped by the lap limit. That's `truncated`. `terminated` is only for an episode that ended in its own right, here tyres up to temperature."
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
Neil's tyres warm up 20 degrees a lap, and are ready at 100. He allows three warm-up laps. Watch which flag each lap sets.
