---
id: learn-path
type: learn
title: The way back
concept: bfs
code: |
  came_from = {"gate": None, "paddock": "gate", "food-court": "gate", "pits": "paddock"}

  place = "pits"
  path = []
  while place is not None:
      path.append(place)
      place = came_from[place]
  print(path)
  print(path[::-1])
---
BFS finds the goal, but Neil wants the route. So as it goes, keep a note for each place of the place it was first reached from: `came_from[neighbour] = place`. The start's note is `None`.

When the goal comes off the queue, follow the notes backwards: the goal, the place before it, the place before that, until a note says `None`. That's the route back to front, so turn it round with `[::-1]`.

BFS reaches every place by the fewest roads first, so this route is a shortest one.

The example follows the notes from the pits. It prints `['pits', 'paddock', 'gate']`, then `['gate', 'paddock', 'pits']`.

The usual slip is to forget to turn it round.
