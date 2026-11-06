---
id: predict-dijkstra
type: predict
title: In order of minutes
concept: dijkstra
code: |
  import heapq

  MINUTES = {
      "gate": {"paddock": 5, "food-court": 1},
      "food-court": {"gate": 1, "merch-stand": 1},
      "merch-stand": {"food-court": 1, "paddock": 1},
      "paddock": {"gate": 5, "merch-stand": 1},
  }

  best = {"gate": 0}
  settled = set()
  waiting = [(0, "gate")]
  while waiting:
      minutes, place = heapq.heappop(waiting)
      if place in settled:
          continue
      settled.add(place)
      print(place, minutes)
      for neighbour, road in MINUTES[place].items():
          if neighbour not in best or minutes + road < best[neighbour]:
              best[neighbour] = minutes + road
              heapq.heappush(waiting, (best[neighbour], neighbour))
question: What does this print?
options:
  - text: |-
      gate 0
      food-court 1
      merch-stand 2
      paddock 3
    correct: true
    feedback: "Right. The paddock goes in at 5, then again at 3 by the merch stand. The 3 comes off first and settles it. The old 5 comes off later and is skipped."
  - text: |-
      gate 0
      paddock 5
      food-court 1
      merch-stand 2
    misconception: dijkstra-settles-in-reached-order
    feedback: "That's the order places were first reached, as BFS would take them. The heap hands out the smallest minutes first, so the food court, at 1, comes before the paddock."
  - text: |-
      gate 0
      food-court 1
      merch-stand 2
      paddock 5
    misconception: dijkstra-keeps-first
    feedback: "Going round by the merch stand gets to the paddock in 3, which beats 5. The `if` notes the quicker minutes and pushes the paddock again."
---
Each place is printed when it's settled. The direct road to the paddock is the slow one.
