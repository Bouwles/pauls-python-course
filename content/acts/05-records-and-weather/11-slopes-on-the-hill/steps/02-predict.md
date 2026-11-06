---
id: predict
type: predict
title: How steep, not how high
concept: derivatives
dialogue:
  - paul.unimpressed: "Thirty-two metres up at four hundred along. That's the height. I asked how steep."
code: |
  def height(metres):
      return 0.0002 * metres ** 2      # the lane up to the park: gentle, then steeper


  tiny = 0.001
  for metres in [100, 200, 400]:
      rise = height(metres + tiny) - height(metres)
      print(metres, round(height(metres)), round(rise / tiny, 2))
question: What does this print?
options:
  - text: |-
      100 2 0.04
      200 8 0.08
      400 32 0.16
    correct: true
    feedback: "Right. The lane gets steeper as it climbs: its slope doubles every time the distance does. At 400 metres along it rises 0.16 metres for every metre walked, about 1 in 6."
  - text: |-
      100 2 0.04
      200 8 0.04
      400 32 0.04
    misconception: curve-slope-constant
    feedback: "That would be a straight lane. This one curves upwards, so a tiny step near the top climbs more than the same step near the bottom: the slope changes along it."
  - text: |-
      100 2 0.02
      200 8 0.04
      400 32 0.08
    misconception: slope-is-average-so-far
    feedback: "That's each height divided by the distance from the bottom: the average slope of the whole lane so far. The slope at a point is measured over a tiny step there, and since the lane steepens, the end is steeper than the average."
  - text: |-
      100 2 2.0
      200 8 8.0
      400 32 32.0
    misconception: slope-is-value
    feedback: "Those are the heights again. The slope is how fast the height changes: the rise over a tiny step, divided by the step."
after: |
  Run it. Then put `from workshop import show_hill` at the top, change the list to `range(0, 501, 20)`, and add this inside the loop:

  ```python
  show_hill(metres, height(metres), curve=height, title=f"slope {rise / tiny:.2f}")
  ```

  Press Run. The walker climbs the lane, with the slope under its feet written above it.
---
Another lane up to the park, measured at three points, height first and then slope.
