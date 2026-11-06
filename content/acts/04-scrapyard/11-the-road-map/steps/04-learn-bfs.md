---
id: learn-bfs
type: learn
title: Nearest first
concept: bfs
code: |
  from collections import deque

  ROADS = {
      "gate": ["paddock", "food-court"],
      "paddock": ["gate", "pits"],
      "food-court": ["gate"],
      "pits": ["paddock"],
  }

  seen = {"gate"}
  queue = deque(["gate"])
  while queue:
      place = queue.popleft()
      print(place)
      for neighbour in ROADS[place]:
          if neighbour not in seen:
              seen.add(neighbour)
              queue.append(neighbour)
---
**Breadth-first search**, or BFS, visits a graph nearest first: the start, then everything one road away, then everything two roads away. Picture a ripple spreading from a stone dropped in a pond.

It keeps a queue of places to visit, and a set, `seen`, of places already queued. Take the place at the front. For each neighbour not seen yet, mark it seen and queue it at the back. The queue is first in, first out, so nearer places always come out first.

The example starts at the gate and prints `gate`, `paddock`, `food-court`, `pits`.

Each place is queued once and each road looked at once. The usual slip is to mark a place when it comes off the queue, not when it goes on. Then it can be queued twice.
