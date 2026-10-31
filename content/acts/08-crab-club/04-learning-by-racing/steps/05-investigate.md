---
id: investigate
type: investigate
title: How the news travels
concept: td-learning
code: |
  # The practice corridor: tiles 0 to 3, then the finish, tile 4.
  # The crab always goes right and never slips.
  GAMMA = 0.9
  ALPHA = 1.0   # take the whole of each lesson, so it's easy to see
  races = 1


  def race():
      """One race from tile 0: (tile, reward, next tile, over) for each step."""
      return [(tile, 10 if tile == 3 else -1, tile + 1, tile == 3) for tile in range(4)]


  mc = [0.0] * 5
  td = [0.0] * 5
  for _ in range(races):
      steps = race()
      # Monte Carlo: wait for the end, then credit each tile with what followed.
      total = 0
      for tile, reward, after, over in reversed(steps):
          total = reward + GAMMA * total
          mc[tile] += ALPHA * (total - mc[tile])
      # TD(0): nudge each tile as the crab leaves it, from the next tile's estimate.
      for tile, reward, after, over in steps:
          target = reward + (0 if over else GAMMA * td[after])
          td[tile] += ALPHA * (target - td[tile])

  print("MC:", [round(v, 2) for v in mc])
  print("TD:", [round(v, 2) for v in td])
tasks:
  - id: one-race
    prompt: "Run it. After one race, how many tiles does TD credit with anything from the finish's 10?"
    kind: answer
    accept: ["1", "one", "one tile", "just one", "only one", "tile 3", "only tile 3", "just tile 3", "1 tile"]
    feedback: "One. When tile 2 was updated, tile 3 was still at 0.0, so tile 2 learned nothing about the finish. TD passes news back one tile at a time, like the sweeps of policy evaluation. Monte Carlo waited for the end, so every tile got the finish in its return at once."
    wrong: "Look for the TD values that are bigger than -1."
  - id: catching-up
    prompt: "Set `races` to 2, then 3, then 4. After how many races does TD agree with Monte Carlo?"
    kind: answer
    accept: ["4", "four", "4 races", "four races", "after 4", "after four", "after 4 races", "after four races"]
    feedback: "Four: one race for each tile between the start and the finish. TD learns a guess from a guess, and the guesses only get good from the finish backwards. In exchange, it never has to wait for a race to end."
    wrong: "Run each one and compare the two lines. When are they the same?"
---
Both learners see the same race. The difference is when they learn, and from what. Monte Carlo waits for the end and uses the real return. TD learns at every step, from the next tile's estimate, which may still be wrong.
