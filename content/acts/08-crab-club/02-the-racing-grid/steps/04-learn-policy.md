---
id: learn-policy
type: learn
title: A rulebook for every tile
concept: mdps
code: |
  TRADITIONAL = {
      (0, 0): "right", (0, 1): "right", (0, 2): "right",
      (1, 0): "up", (1, 2): "up",
      (2, 0): "right", (2, 1): "right", (2, 2): "right", (2, 3): "up",
  }
  print(TRADITIONAL[(2, 0)])
  print(TRADITIONAL[(1, 0)])   # where a slip up would put it
---
A **policy** is the agent's rulebook: one action for every state it could be in. In Python it's a dictionary from tile to action.

It isn't a route. A route, like "right, right, right, up", assumes every step goes where it's told. The crab slips, so after any step it might be somewhere you didn't plan. A policy has an answer wherever it ends up.

The example is the traditional line: along the bottom and up the far side. On the start it says `right`. If a slip puts the crab on `(1, 0)` instead, the rulebook says `up`, so the example prints `right`, then `up`.

The usual mistake is writing a list of moves. Look the action up by the tile the crab is on now.
