---
id: predict-return
type: predict
title: What a race is worth
concept: returns-discounting
code: |
  gamma = 0.9
  race = [-1, -1, -1, -1, 10]   # four tiles, then the finish

  total = 0
  for t, reward in enumerate(race):
      total += gamma ** t * reward

  print(round(total, 2))
question: What does this print?
options:
  - text: "3.12"
    correct: true
    feedback: "Right. The first reward counts in full, the next 0.9 of it, then 0.81, and so on: -1 - 0.9 - 0.81 - 0.729 + 10 × 0.6561. The prize at the end is only worth 6.56 by the time it's discounted four times."
  - text: "6"
    misconception: discount-ignored
    feedback: "That's the rewards simply added up, -4 + 10. Each reward is multiplied by gamma to the power t first, so later rewards count for less."
  - text: "2.81"
    misconception: discount-starts-at-one
    feedback: "`enumerate` starts t at 0, and gamma to the power 0 is 1. The first reward is never discounted; only the ones after it are."
  - text: "10"
    misconception: only-final-reward-counts
    feedback: "The finish isn't all the race is worth. Every second on the way cost -1, and the return adds those in too."
---
The **return** is what a whole race is worth: every reward added up, each one multiplied by `gamma` once more than the one before. With `gamma` below 1, the same reward counts for less the later it comes. That's **discounting**.

`gamma ** t` is gamma to the power t.
