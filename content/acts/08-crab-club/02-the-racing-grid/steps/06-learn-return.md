---
id: learn-return
type: learn
title: What a race is worth
concept: returns-discounting
code: |
  gamma = 0.5
  rewards = [-1, -1, 10]

  total = 0
  for t, reward in enumerate(rewards):
      total += gamma ** t * reward
  print(total)
---
To compare two lines, you need one number for a whole race: its **return**. It adds up the race's rewards, but a reward later on counts for less. That's **discounting**.

The amount is set by **gamma** (the Greek letter γ), a number from 0 to 1. The first reward counts in full. The next is multiplied by gamma, the one after by gamma times gamma, and so on: reward number `t`, counting from 0, is multiplied by gamma to the power `t`, written `gamma ** t`.

With gamma 0.5, the example works out -1, then -0.5, then 10 times 0.25, and prints `1.0`.

Gamma near 0 cares only about the next reward or two. Gamma near 1 counts the far future almost as much as now. The usual mistake is discounting the first reward too.
