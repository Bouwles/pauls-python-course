---
id: predict-hump
type: predict
title: The sun's height
concept: correlation-causation
dialogue:
  - aaesha.pleased.point: "The sun climbs all morning and sinks all afternoon. Its height depends entirely on the hour."
code: |
  import numpy as np

  hours = np.arange(-6, 7)        # hours from midday
  height = 36 - hours ** 2        # how high the sun climbs, roughly
  print(round(np.corrcoef(hours, height)[0, 1], 2))
question: What does this print?
options:
  - text: "0.0"
    correct: true
    feedback: "Right. Correlation measures how well the points fit a straight, sloping line. The morning rises and the afternoon falls by the same amounts, and the two cancel out exactly, even though the hour decides the height completely."
  - text: "1.0"
    misconception: correlation-measures-any-link
    feedback: "The height does depend entirely on the hour, but correlation only looks for a straight line. A hump has none: the rising half and the falling half cancel out to 0."
after: |
  Run it. Then change `hours` to `np.arange(-6, 1)`, the morning only, and run it again.
---
The sun's height through a day, against the hour.
