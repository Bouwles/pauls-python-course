---
id: predict-merge
type: predict
title: When the loop stops
concept: merge-sort
code: |
  left = [3, 8]
  right = [1, 4, 10]
  merged = []
  next_left = 0
  next_right = 0
  while next_left < len(left) and next_right < len(right):
      if left[next_left] <= right[next_right]:
          merged.append(left[next_left])
          next_left = next_left + 1
      else:
          merged.append(right[next_right])
          next_right = next_right + 1
  print(merged)
  print(left[next_left:], right[next_right:])
question: What does this print?
options:
  - text: |-
      [1, 3, 4, 8]
      [] [10]
    correct: true
    feedback: "Right. Once the 8 is taken, `left` has nothing left, so the loop stops with the 10 still in `right`. Tipping it on the end finishes the merge."
  - text: |-
      [1, 3, 4, 8, 10]
      [] []
    misconception: merge-loop-takes-all
    feedback: "The loop runs only while both piles have laps left. When `left` runs out, it stops, and the 10 is still waiting in `right`."
  - text: |-
      [1, 4, 10]
      [3, 8] []
    misconception: merge-takes-whole-pile
    feedback: "A merge takes one lap at a time, the faster of the two fronts. It doesn't take the whole pile whose front is faster."
---
The merge from the last step, without the tipping at the end.
