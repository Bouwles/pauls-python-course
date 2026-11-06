---
id: learn-bandits
type: learn
title: Try things and keep score
concept: bandits
dialogue:
  - aaesha.pleased: "Try something, see how it went, do a bit better next time. That's most of learning."
code: |
  estimates = [0.0, 0.0]
  counts = [0, 0]
  for screen, reward in [(0, 1), (0, 0), (1, 1), (0, 1)]:
      counts[screen] += 1
      estimates[screen] += (reward - estimates[screen]) / counts[screen]
  print(estimates, counts)
---
An **agent** is a program that learns by trying: it makes a choice, sees how it went, and keeps score.

The simplest case is a **multi-armed bandit**, named after a row of slot machines, each paying out at a rate nobody tells you. Each choice is an **arm**: here, one of Caitlin's four attract screens. A visitor who plays is a **reward** of 1; one who walks on, 0.

For each arm, keep a count and an **estimate**, its average reward so far. Line 5 needs no list: it moves the estimate towards each new reward, all the way for the first, half way for the second, a third of the way for the third. The example prints `[0.6666666666666666, 1.0] [3, 1]`.

The usual mistake is reading the estimate as the last reward. It's the average of them all.
