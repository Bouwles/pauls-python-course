---
id: worked
type: worked
title: How long Paul's walks take
dialogue:
  - paul: "Roads are fine. Minutes are better. I walk slowly, so I count minutes."
code: |
  import heapq

  from workshop import show_graph

  MINUTES = {
      "clocktower": {"cafe": 2, "bookshop": 3, "market": 8},
      "cafe": {"clocktower": 2, "station": 2, "library": 3},
      "bookshop": {"clocktower": 3, "library": 2, "market": 4},
      "library": {"bookshop": 2, "cafe": 3, "city-hall": 2},
      "station": {"cafe": 2, "city-hall": 2, "theatre": 4},
      "city-hall": {"library": 2, "station": 2},
      "theatre": {"station": 4},
      "market": {"clocktower": 8, "bookshop": 4},
  }

  best = {"clocktower": 0}
  settled = set()
  waiting = [(0, "clocktower")]
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

Run it and play the drawing: the settled places spread out from the Clocktower in order of minutes. The market is settled at 7, by the bookshop, though its direct road is 8.
