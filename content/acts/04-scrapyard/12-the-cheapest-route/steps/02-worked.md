---
id: worked
type: worked
title: How long Paul's walks take
dialogue:
  - paul.laughing: "Roads are fine. Minutes are better. I walk slowly, so I count minutes."
code: |
  import heapq

  from workshop import show_graph

  MINUTES = {
      "main-gate": {"fan-zone": 2, "food-court": 3, "campsite": 8},
      "fan-zone": {"main-gate": 2, "paddock": 2, "merch-stand": 3},
      "food-court": {"main-gate": 3, "merch-stand": 2, "campsite": 4},
      "merch-stand": {"food-court": 2, "fan-zone": 3, "grandstand": 2},
      "paddock": {"fan-zone": 2, "grandstand": 2, "hairpin": 4},
      "grandstand": {"merch-stand": 2, "paddock": 2},
      "hairpin": {"paddock": 4},
      "campsite": {"main-gate": 8, "food-court": 4},
  }

  best = {"main-gate": 0}
  settled = set()
  waiting = [(0, "main-gate")]
  while waiting:
      minutes, place = heapq.heappop(waiting)
      if place in settled:
          continue
      settled.add(place)
      show_graph(MINUTES, visited=settled, frontier=[name for _, name in waiting], current=place, distances=best)
      for neighbour, road in MINUTES.get(place, {}).items():
          if neighbour not in best or minutes + road < best[neighbour]:
              best[neighbour] = minutes + road
              heapq.heappush(waiting, (best[neighbour], neighbour))

  for place in sorted(best, key=best.get):
      print(f"{place}: {best[place]} minutes")
subgoals:
  - label: "The start is 0 minutes away; nothing is settled yet"
    lines: [16, 18]
  - label: While anywhere is waiting
    lines: [19, 19]
  - label: Take the nearest waiting place
    lines: [20, 20]
  - label: "Settled already? Then this is an old entry: skip it"
    lines: [21, 22]
  - label: Settle it
    lines: [23, 24]
  - label: "Down each road: if this way is quicker, note the minutes and put it in waiting"
    lines: [25, 28]
explain:
  prompt: "Why can Paul settle a place for good the moment it comes off the heap?"
  answer: "It's the nearest of everything still waiting. Any other way to it would have to go through a place that's at least as far already, and no road takes less than 0 minutes, so nothing found later can be quicker."
  concept: dijkstra
---
This is **Dijkstra's algorithm**. `waiting` is a heap of `(minutes, place)`, so `heappop` always gives the nearest place not yet settled. When a quicker way to a neighbour turns up, it goes in again with the new minutes; the old entry stays in the heap, and gets skipped when it comes out.

Run it and play the drawing: the settled places spread out from the main gate in order of minutes. The campsite is settled at 7, by the food court, though its direct road is 8.
