---
id: predict-binary
type: predict
title: Which ones does it look at?
concept: binary-search
code: |
  def find(laps, wanted):
      low = 0
      high = len(laps) - 1
      while low <= high:
          middle = (low + high) // 2
          print("Look at", middle)
          if laps[middle] == wanted:
              return middle
          elif laps[middle] < wanted:
              low = middle + 1
          else:
              high = middle - 1
      return -1


  laps = [41, 43, 44, 46, 47, 49, 52]
  print(find(laps, 43))
question: What does this print?
options:
  - text: |-
      Look at 3
      Look at 1
      1
    correct: true
    feedback: "Right. The middle of 0 to 6 is 3, which holds 46, too big. So `high` becomes 2, and the middle of 0 to 2 is 1, which holds 43."
  - text: |-
      Look at 0
      Look at 1
      1
    misconception: binary-starts-at-front
    feedback: "A binary search never starts at the front. Its first look is the middle, `(0 + 6) // 2`, which is 3."
  - text: |-
      Look at 3
      Look at 2
      Look at 1
      1
    misconception: binary-steps-one-place
    feedback: "After a miss it doesn't step one place along. 46 is too big, so `high` becomes 2, and the next look is the middle of what's left, 1."
---
Neil's lap times, in seconds, fastest first. The search is the one from the last step.
