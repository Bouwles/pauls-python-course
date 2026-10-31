---
id: predict-td
type: predict
title: Learning from a guess
concept: td-learning
code: |
  values = {(1, 2): 0.0, (0, 2): 8.0}
  alpha = 0.5
  gamma = 0.9

  # The crab was on (1, 2), was told up, got -1, and landed on (0, 2).
  tile, reward, after, over = (1, 2), -1, (0, 2), False

  target = reward + (0 if over else gamma * values[after])
  values[tile] += alpha * (target - values[tile])
  print(round(values[tile], 2))
question: "One TD update, in the middle of a race. What does this print?"
options:
  - text: "3.1"
    correct: true
    feedback: "Right. The target is -1 + 0.9 × 8.0 = 6.2: what the step earned, plus what (0, 2) is thought to be worth. alpha 0.5 moves the estimate half way from 0.0 to 6.2."
  - text: "6.2"
    misconception: td-replaces-value
    feedback: "6.2 is the target, but one step is one noisy sample: the crab might have slipped into the pool instead. alpha says how far to move towards it. With alpha 0.5, half way."
  - text: "-0.5"
    misconception: td-ignores-next-value
    feedback: "That uses the reward alone. The target also counts where the crab landed: gamma times (0, 2)'s estimate, 7.2. That's the whole trick of TD."
  - text: "0.0"
    misconception: td-waits-for-end
    feedback: "Monte Carlo waits for the end of the race. TD doesn't need to: the next tile's estimate stands in for everything that hasn't happened yet, so it learns after every step."
---
**TD(0)** learns as it goes. After each step, it already has a fair guess at the return from the tile it left: the reward it just got, plus `gamma` times its current estimate for the tile it landed on. That guess is the **TD target**. Target minus the old estimate is the **TD error**: how surprised it was.

`alpha` says how far to move towards the target each time.
