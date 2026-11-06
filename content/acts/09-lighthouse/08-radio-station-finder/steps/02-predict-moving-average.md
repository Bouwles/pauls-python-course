---
id: predict-moving-average
type: predict
title: The ends of the dial
concept: slicing
code: |
  readings = [3.0, 6.0, 9.0, 6.0]
  half = 1

  smoothed = []
  for i in range(len(readings)):
      nearby = readings[max(0, i - half): i + half + 1]
      smoothed.append(sum(nearby) / len(nearby))
  print(smoothed)
question: What does this print?
options:
  - text: "[4.5, 6.0, 7.0, 7.5]"
    correct: true
    feedback: "Right. At index 0 the slice is `[3.0, 6.0]`, so the mean is 4.5; at the far end it's `[9.0, 6.0]`, 7.5. Each mean is of the readings the slice really holds."
  - text: "[3.0, 6.0, 7.0, 5.0]"
    misconception: ends-divide-by-window
    feedback: "That divides the ends by 3, the full window. The slice at each end holds only two readings, and `len(nearby)` is 2."
---
Four readings, a window of 3. Work out the slice at each position first, ends included, then each mean.
