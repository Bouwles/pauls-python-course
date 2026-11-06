---
id: worked
type: worked
title: How far Paul walks
dialogue:
  - paul.neutral: "I'm coming on the Sunday. I like to know how far everything is from the gate, in roads."
code: |
  from collections import deque
  from workshop import show_graph

  ROADS = {
      "campsite": ["main-gate", "food-court", "car-park"],
      "main-gate": ["campsite", "fan-zone", "food-court"],
      "fan-zone": ["main-gate", "paddock", "merch-stand"],
      "paddock": ["fan-zone", "big-screen", "grandstand", "hairpin"],
      "big-screen": ["paddock", "footbridge", "chicane"],
      "footbridge": ["big-screen", "hairpin", "tunnel", "viewing-bank"],
      "hairpin": ["paddock", "footbridge"],
      "viewing-bank": ["footbridge"],
      "food-court": ["campsite", "main-gate", "merch-stand"],
      "merch-stand": ["food-court", "fan-zone", "grandstand"],
      "grandstand": ["merch-stand", "paddock", "chicane", "media-centre"],
      "chicane": ["grandstand", "big-screen", "kart-track"],
      "kart-track": ["chicane", "tunnel", "back-straight"],
      "tunnel": ["kart-track", "footbridge"],
      "car-park": ["campsite", "media-centre"],
      "media-centre": ["car-park", "grandstand", "back-straight"],
      "back-straight": ["media-centre", "kart-track"],
  }

  roads_from_gate = {"main-gate": 0}
  queue = deque(["main-gate"])
  while queue:
      place = queue.popleft()
      show_graph(ROADS, visited=roads_from_gate, frontier=queue, current=place)
      for neighbour in ROADS.get(place, []):
          if neighbour not in roads_from_gate:
              roads_from_gate[neighbour] = roads_from_gate[place] + 1
              queue.append(neighbour)

  for place, roads_away in roads_from_gate.items():
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
Paul's walk is a breadth-first search that keeps a note of how far each place is, instead of where it came from. A place's distance is one more than the place it was first reached from, and because the queue hands out nearest first, the first time is always by the fewest roads.

`ROADS.get(place, [])` treats a place with no list as a dead end. Press Run and play the drawing: `show_graph` is called once each time round the loop.

The labels beside the code are the steps he took. Your `shortest_path` takes the same steps, with tiles for places and `came_from` notes for distances.
