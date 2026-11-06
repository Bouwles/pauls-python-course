---
id: learn-dijkstra
type: learn
title: Nearest unfinished place first
concept: dijkstra
code: |
  import heapq

  MINUTES = {
      "campsite": {"main-gate": 8, "food-court": 4},
      "food-court": {"campsite": 4, "main-gate": 3},
      "main-gate": {"campsite": 8, "food-court": 3},
  }

  best = {"campsite": 0}
  settled = set()
  waiting = [(0, "campsite")]
  while waiting:
      minutes, place = heapq.heappop(waiting)
      if place in settled:
          continue
      settled.add(place)
      for neighbour, road in MINUTES[place].items():
          if neighbour not in best or minutes + road < best[neighbour]:
              best[neighbour] = minutes + road
              heapq.heappush(waiting, (best[neighbour], neighbour))
  print(best)
---
**Dijkstra's algorithm** finds the quickest time from a start to every place. Picture runners leaving the campsite down every road at once: each place is finished when the first runner arrives, so places finish in order of time.

It keeps `best`, the quickest minutes found so far for each place, and a heap of `(minutes, place)` waiting. Pop the nearest. If it's **settled** already, finished, skip it. Otherwise settle it, and down each road out: if this way beats the best so far, note the new minutes and push the neighbour.

A settled place is final, because everything still waiting is at least as far. In the example the main gate is reached in 8, then beaten by 7 through the food court. It prints `{'campsite': 0, 'main-gate': 7, 'food-court': 4}`.

The usual slip is to keep the first minutes found, as BFS does.
