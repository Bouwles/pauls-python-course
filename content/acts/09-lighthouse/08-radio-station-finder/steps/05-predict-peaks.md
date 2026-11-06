---
id: predict-peaks
type: predict
title: A flat top
concept: looping-lists
code: |
  smoothed = [0.2, 0.7, 0.9, 0.9, 0.4, 0.3, 0.4, 0.3]
  floor = 0.5

  peaks = []
  for i in range(1, len(smoothed) - 1):
      if smoothed[i] > smoothed[i - 1] and smoothed[i] >= smoothed[i + 1] and smoothed[i] >= floor:
          peaks.append(i)
  print(peaks)
question: What does this print?
options:
  - text: "[2]"
    correct: true
    feedback: "Right. Position 2 is higher than 0.7 and as high as the 0.9 after it. Position 3 is not higher than the 0.9 before it, so the flat top counts once. The bump at 6 is under the floor."
  - text: "[2, 3]"
    misconception: plateau-counted-twice
    feedback: "Position 3 has to be higher than the reading before it, and 0.9 isn't higher than 0.9. Only the first reading of the flat top passes."
  - text: "[2, 6]"
    misconception: peak-ignores-floor
    feedback: "The 0.4 at position 6 is a bump, but it's under the floor of 0.5. Hiss makes bumps like that all along the dial."
---
A station with a flat top, and a small bump further along. Check each position against all three rules.
