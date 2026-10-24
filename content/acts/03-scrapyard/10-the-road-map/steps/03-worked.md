---
id: worked
type: worked
title: How far Moss walks
dialogue:
  - moss: "I walk everywhere. I like to know how far, in roads."
code: |
  from collections import deque
  from saltmarsh import show_graph

  ROADS = {
      "scrapyard": ["workshop", "tailor", "records-office"],
      "workshop": ["scrapyard", "bakery", "tailor"],
      "bakery": ["workshop", "post-office", "library"],
      "post-office": ["bakery", "pub", "town-hall", "ferry"],
      "pub": ["post-office", "harbour-office", "greengrocer"],
      "harbour-office": ["pub", "ferry", "crab-club", "lighthouse"],
      "ferry": ["post-office", "harbour-office"],
      "lighthouse": ["harbour-office"],
      "tailor": ["scrapyard", "workshop", "library"],
      "library": ["tailor", "bakery", "town-hall"],
      "town-hall": ["library", "post-office", "greengrocer", "weather-station"],
      "greengrocer": ["town-hall", "pub", "bike-shed"],
      "bike-shed": ["greengrocer", "crab-club", "observatory"],
      "crab-club": ["bike-shed", "harbour-office"],
      "records-office": ["scrapyard", "weather-station"],
      "weather-station": ["records-office", "town-hall", "observatory"],
      "observatory": ["weather-station", "bike-shed"],
  }

  roads_from_workshop = {"workshop": 0}
  queue = deque(["workshop"])
  while queue:
      place = queue.popleft()
      show_graph(ROADS, visited=roads_from_workshop, frontier=queue, current=place)
      for neighbour in ROADS.get(place, []):
          if neighbour not in roads_from_workshop:
              roads_from_workshop[neighbour] = roads_from_workshop[place] + 1
              queue.append(neighbour)

  for place, roads_away in roads_from_workshop.items():
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
  prompt: "Moss marks a place as reached when he queues it, not when he takes it off the queue. Why?"
  answer: "A place can be next to several places in the queue. Marked when it's queued, it's queued once. Marked only when it comes off, every neighbour that sees it first would queue it again, and on a big map the queue fills with repeats."
  concept: bfs
---
The dictionary does two jobs: it remembers which places have been reached, and how many roads away each one is. A place's distance is one more than the place it was first reached from, and because the queue hands out nearest first, the first time is always by the fewest roads.

`ROADS.get(place, [])` treats a place with no list as a dead end.

Press Run and play the drawing: `show_graph` is called once each time round the loop, with what's been reached, what's queued, and where Moss is now.
