---
id: predict-circle
type: predict
title: Round the compass
concept: feature-engineering
dialogue:
  - neil.thinking.point: "The skipper's note says a northerly's a northerly. Three-fifty or ten, it blows the same. Pilots would agree."
code: |
  import numpy as np


  def arrow(speed, direction):
      angle = np.radians(direction)
      return np.array([speed * np.sin(angle), speed * np.cos(angle)])


  # Two mornings of a 15-knot wind: from 350 degrees, then from 10 degrees
  print(abs(350 - 10))
  print(round(float(np.linalg.norm(arrow(15, 350) - arrow(15, 10))), 1))
question: "How far apart are the two winds: as compass numbers, then as arrows?"
options:
  - text: |-
      340
      5.2
    correct: true
    feedback: "Right. As numbers they're 340 apart, nearly opposite ends of the scale. As arrows, east and north parts, they're 5.2 knots apart: nearly the same wind, as the skipper says."
  - text: |-
      20
      5.2
    misconception: numbers-know-the-compass
    feedback: "Python sees 350 and 10 as two numbers, and they're 340 apart. Nothing tells it the compass goes round. A model fed the raw degrees thinks a northerly at 350 is nothing like one at 10."
  - text: |-
      340
      340.0
    misconception: features-change-nothing
    feedback: "The arrow's parts are the wind's push east and push north. Winds from 350 and 10 push almost the same way, so their arrows differ by only 5.2 knots. Same readings, written so the model can see what the skipper sees."
after: |
  Run it. Then try 170 and 190: as numbers they're 20 apart, the same as 350 and 10 should be.
---
**Feature engineering** is rewriting the readings so the model can use what they mean: a wind as an arrow instead of a compass number, a clock time as hours from dawn, today's pressure as its change since yesterday. A model can only find a pattern that's there in its columns.
