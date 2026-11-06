---
id: learn-epsilon-decay
type: learn
title: Explore less as it learns
concept: exploration-exploitation
code: |
  def epsilon_at(episode, decay=100, final=0.05):
      if episode >= decay:
          return final
      return 1.0 - (1.0 - final) * episode / decay


  for episode in [0, 25, 50, 100, 150]:
      print(episode, round(epsilon_at(episode), 3))
---
A new network knows nothing, so its first moves are worth exploring. Later it knows the grid, and exploring mostly wastes moves. So epsilon starts high and falls.

The usual schedule falls in a straight line: epsilon is 1.0 at race 0, so every move is random, and drops by the same amount each race until it reaches a small `final` value, 0.05, at race `decay`. From then on it stays at 0.05, so the crab never quite stops exploring.

In words: one, minus (one minus final) times the share of the way to `decay`. The example prints 1.0, 0.762, 0.525, then 0.05 twice.

The usual mistake is letting epsilon fall to 0. Then a wrong guess is never tested again.
