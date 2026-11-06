---
id: predict-dot
type: predict
title: Dead ahead
concept: vectors
dialogue:
  - neil.thinking.point: "Twelve knots out of the north. Which way the plane is pointing is the whole question."
code: |
  import numpy as np

  wind = np.array([0.0, 12.0])      # 12 knots, from due north

  for heading in [0, 90, 180]:
      angle = np.radians(heading)
      ahead = np.array([np.sin(angle), np.cos(angle)])   # one knot, dead ahead
      print(heading, round(np.dot(wind, ahead), 1))
question: What does this print?
options:
  - text: |-
      0 12.0
      90 0.0
      180 -12.0
    correct: true
    feedback: "Right. Heading north, all 12 knots are in your face. Heading east, the wind is square from the side and none of it is ahead. Heading south, it's behind you: minus 12, a tailwind."
  - text: |-
      0 12.0
      90 12.0
      180 12.0
    misconception: dot-ignores-direction
    feedback: "The dot product isn't only about how long the arrows are. It measures how much of one lies along the other: all of it when they line up, none at right angles, and less than none when they point apart."
  - text: |-
      0 12.0
      90 0.0
      180 0.0
    misconception: dot-never-negative
    feedback: "A dot product can be below 0. Heading south, the wind arrow points the opposite way to `ahead`, so each pair multiplies to minus, and the answer is -12: the wind is behind you."
  - text: Three pairs of numbers, such as `0 [ 0. 12.]`
    misconception: dot-gives-vector
    feedback: "That's `wind * ahead`, the pairs multiplied. `np.dot` goes on to add them up, so each line has one number."
after: |
  Run it. Then add 45 to the list of headings and predict that line before you run it again.
---
Twelve knots from due north, and a one-knot `ahead` arrow for three headings.
