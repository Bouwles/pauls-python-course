---
id: learn-dfs
type: learn
title: As far as it goes
concept: dfs
code: |
  ROADS = {
      "gate": ["paddock", "food-court"],
      "paddock": ["gate", "pits"],
      "food-court": ["gate"],
      "pits": ["paddock"],
  }
  order = []


  def explore(place):
      order.append(place)
      for neighbour in ROADS[place]:
          if neighbour not in order:
              explore(neighbour)


  explore("gate")
  print(order)
---
**Depth-first search**, or DFS, follows one road as far as it goes before trying the next. Picture exploring a new circuit on foot: down a road, keep going, and only turn back at a dead end or somewhere you've already been.

A function that calls itself does it neatly. `explore(place)` notes the place, then calls `explore` on each neighbour not reached yet. The calls waiting on the call stack remember where to come back to.

From the gate it prints `['gate', 'paddock', 'pits', 'food-court']`: down to the pits first, and only then back for the food court. BFS gave the food court before the pits.

DFS doesn't find the shortest routes, but it reaches everywhere that can be reached. The usual slip is to expect nearest first. That's BFS.
