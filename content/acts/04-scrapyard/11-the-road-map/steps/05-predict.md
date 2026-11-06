---
id: predict
type: predict
title: Which comes out first?
concept: bfs
code: |
  from collections import deque

  ROADS = {
      "main-gate": ["fan-zone", "food-court"],
      "fan-zone": ["main-gate", "paddock"],
      "food-court": ["main-gate", "merch-stand"],
      "paddock": ["fan-zone", "merch-stand", "hairpin"],
      "merch-stand": ["food-court", "paddock"],
      "hairpin": ["paddock"],
  }

  seen = {"main-gate"}
  queue = deque(["main-gate"])
  while queue:
      place = queue.popleft()
      print(place)
      for neighbour in ROADS[place]:
          if neighbour not in seen:
              seen.add(neighbour)
              queue.append(neighbour)
question: What does this print?
options:
  - text: |-
      main-gate
      fan-zone
      food-court
      paddock
      merch-stand
      hairpin
    correct: true
    feedback: "Right. Everything one road away comes out before anything two roads away, because the queue is first in, first out. The hairpin is three roads off, so it's last."
  - text: |-
      main-gate
      fan-zone
      paddock
      merch-stand
      food-court
      hairpin
    misconception: bfs-goes-deep
    feedback: "That follows one road as far as it goes before trying the next. A queue doesn't: the food court joined the queue before the paddock, so it comes out first."
  - text: |-
      main-gate
      fan-zone
      food-court
      paddock
      merch-stand
      merch-stand
      hairpin
    misconception: bfs-queues-twice
    feedback: "Two roads lead to the merch stand, but it goes into `seen` the first time it's queued. The second time, `neighbour not in seen` is False, and it's left alone."
after: |
  Run it. Then add `show_graph(ROADS, visited=seen, frontier=queue, current=place)` just after `print(place)`, with `from workshop import show_graph` at the top, and run it again. Watch the queue spread out from the main gate like a ripple.
---
The same search from the main gate, on a bigger part of the circuit. Two roads lead to the merch stand.
