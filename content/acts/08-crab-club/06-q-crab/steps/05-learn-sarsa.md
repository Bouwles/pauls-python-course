---
id: learn-sarsa
type: learn
title: What it will actually do
concept: sarsa
code: |
  next_q = {"up": 5.0, "down": 3.0, "left": 4.0, "right": 9.0}   # Q on the tile it landed on
  next_action = "down"   # epsilon-greedy has just explored, and picked down

  print("Q-learning looks ahead to", max(next_q.values()))
  print("SARSA looks ahead to", next_q[next_action])
---
Q-learning's target assumes the crab plays its best from the next tile. But one move in ten it explores, and an exploring step can be a bad one.

**SARSA** learns what the crab's real behaviour is worth, exploring and all. It chooses the next move first, then uses *that* move's Q-value in the target. The name is the five things one update needs: **S**tate, **A**ction, **R**eward, the next **S**tate, and the next **A**ction.

So Q-learning learns the worth of the best policy while it explores, which is called **off-policy**. SARSA learns the worth of the policy it's following, **on-policy**. The example prints 9.0 for Q-learning and 3.0 for SARSA.

Near a hazard, the difference shows. SARSA counts its own stumbles, so it keeps a safer distance.
