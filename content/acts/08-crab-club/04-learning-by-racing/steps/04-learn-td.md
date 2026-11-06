---
id: learn-td
type: learn
title: Learning from a guess
concept: td-learning
code: |
  values = {"A": 0.0, "B": 4.0}
  alpha = 0.1
  gamma = 0.9

  # The crab left A, earned -1, and landed on B. The race goes on.
  target = -1 + gamma * values["B"]
  error = target - values["A"]
  values["A"] += alpha * error
  print(round(target, 2), round(error, 2), round(values["A"], 2))
---
**Temporal difference** learning, TD for short, doesn't wait for the end. Driving home, you revise your guess of when you'll arrive at every junction, not once you're through the door.

After each step, the crab has a fair guess at the return from the tile it left: the reward it just got, plus gamma times its current estimate for the tile it landed on. That guess is the **TD target**. If the step ended the race, the target is just the reward.

The target minus the old estimate is the **TD error**: how surprised it was. Move the estimate a fraction **alpha** (the Greek letter α) of the way across it. The example prints `2.6 2.6 0.26`.

The usual mistake is setting the estimate to the target outright. One step is one noisy sample, so alpha moves it only part of the way.
