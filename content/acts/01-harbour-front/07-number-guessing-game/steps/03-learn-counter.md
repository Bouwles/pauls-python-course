---
id: learn-counter
type: learn
title: Counting as you go
concept: running-totals
code: |
  total = 0
  rounds = 0
  for points in range(10, 40, 10):
      total = total + points
      rounds = rounds + 1
      print("Round", rounds, "total", total)
  print("Final total:", total)
---
A **running total** is a variable that starts at 0 before a loop and has something added to it on every pass: `total = total + points`.

A **counter** is the same thing, adding 1 each time: `rounds = rounds + 1`. Caitlin's game will count guesses this way.

The example adds 10, 20 and 30. It prints the total after each round, 10, 30 and 60, and then `Final total: 60`.

The usual slip is to put `total = 0` inside the loop. Then it runs on every pass, the total goes back to 0 each time, and only the last amount survives. Set it once, above the loop.
