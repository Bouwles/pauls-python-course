---
id: learn-ucb
type: learn
title: Explore where you're unsure
concept: exploration-exploitation
code: |
  import math

  estimates = [0.60, 0.45]
  counts = [40, 3]
  total = sum(counts)
  for estimate, count in zip(estimates, counts):
      bonus = math.sqrt(math.log(total) / count)
      print(round(estimate + bonus, 2))
---
Epsilon-greedy explores blindly, even screens it's sure are hopeless. **UCB**, short for upper confidence bound, explores where it's least sure.

Each screen's score is its estimate plus a bonus. In words, the bonus is the square root of (the log of the total visitors, divided by this screen's visitors). The log grows very slowly (log 100 is 4.6, log 10,000 only 9.2), so each visitor shown a screen shrinks its bonus. A screen seen by few gets a big bonus: it might be better than it looks. UCB shows the biggest score, and an unseen screen first. The example prints `0.91` and `1.57`.

A number `c` times the bonus sets its weight. The usual mistake is thinking UCB is random. It has no random numbers at all.
