---
id: predict-running-average
type: predict
title: The running average
concept: bandits
code: |
  estimate = 0.0
  count = 0
  for reward in [1, 1, 0, 0]:
      count += 1
      estimate += (reward - estimate) / count
  print(estimate)
question: What does this print?
options:
  - text: "0.5"
    correct: true
    feedback: "Right. Two played and two walked on, so the average is 0.5. The estimate went 1.0, 1.0, 0.667, 0.5 without the loop ever keeping a list."
  - text: "0.0"
    misconception: estimate-is-last-reward
    feedback: "The last reward was 0, but the estimate is the average of all four. The fourth update only moves it a quarter of the way towards 0, from 0.667 to 0.5."
  - text: "2.0"
    misconception: running-average-is-total
    feedback: "That's the total, the sum of the rewards. The update divides each gap by `count`, so it keeps the average, and it needs no list to do it."
---
One screen, four visitors: two played, then two walked on. Follow `estimate` through the loop.
