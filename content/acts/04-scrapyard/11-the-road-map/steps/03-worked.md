---
id: worked
type: worked
title: How far Paul walks
dialogue:
  - paul: "I walk everywhere. I like to know how far, in roads."
code: |
  from collections import deque
  from workshop import show_graph

  ROADS = {
      "market": ["clocktower", "bookshop", "museum"],
      "clocktower": ["market", "cafe", "bookshop"],
      "cafe": ["clocktower", "station", "library"],
      "station": ["cafe", "cinema", "city-hall", "theatre"],
      "cinema": ["station", "bridge", "school"],
      "bridge": ["cinema", "theatre", "pool", "stadium"],
      "theatre": ["station", "bridge"],
      "stadium": ["bridge"],
      "bookshop": ["market", "clocktower", "library"],
      "library": ["bookshop", "cafe", "city-hall"],
      "city-hall": ["library", "station", "school", "gallery"],
      "school": ["city-hall", "cinema", "gym"],
      "gym": ["school", "pool", "park"],
      "pool": ["gym", "bridge"],
      "museum": ["market", "gallery"],
      "gallery": ["museum", "city-hall", "park"],
      "park": ["gallery", "gym"],
  }

  roads_from_clocktower = {"clocktower": 0}
  queue = deque(["clocktower"])
  while queue:
      place = queue.popleft()
      show_graph(ROADS, visited=roads_from_clocktower, frontier=queue, current=place)
      for neighbour in ROADS.get(place, []):
          if neighbour not in roads_from_clocktower:
              roads_from_clocktower[neighbour] = roads_from_clocktower[place] + 1
              queue.append(neighbour)

  for place, roads_away in roads_from_clocktower.items():
      print(f"{place}: {roads_away}")
subgoals:
  - label: Mark the start as reached, and queue it
    lines: [24, 25]
  - label: While anything is queued
    lines: [26, 26]
  - label: Take the place at the front
    lines: [27, 28]
  - label: Look down each road
    lines: [29, 29]
  - label: "If it leads somewhere new: mark it, note how far, and queue it"
    lines: [30, 32]
explain:
  prompt: "Paul marks a place as reached when he queues it, not when he takes it off the queue. Why?"
  answer: "A place can be next to several places in the queue. Marked when it's queued, it's queued once. Marked only when it comes off, every neighbour that sees it first would queue it again, and on a big map the queue fills with repeats."
  concept: bfs
---
The dictionary does two jobs: it remembers which places have been reached, and how many roads away each one is. A place's distance is one more than the place it was first reached from, and because the queue hands out nearest first, the first time is always by the fewest roads.

`ROADS.get(place, [])` treats a place with no list as a dead end.

Press Run and play the drawing: `show_graph` is called once each time round the loop, with what's been reached, what's queued, and where Paul is now.
