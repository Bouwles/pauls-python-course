---
id: predict-path
type: predict
title: Following the notes
concept: bfs
code: |
  came_from = {
      "main-gate": None,
      "food-court": "main-gate",
      "fan-zone": "main-gate",
      "merch-stand": "food-court",
      "grandstand": "merch-stand",
  }

  place = "grandstand"
  path = []
  while place is not None:
      path.append(place)
      place = came_from[place]
  print(path[::-1])
question: What does this print?
options:
  - text: "['main-gate', 'food-court', 'merch-stand', 'grandstand']"
    correct: true
    feedback: "Right. The grandstand was reached from the merch stand, that from the food court, and that from the main gate. Turned round, it's the route from the gate."
  - text: "['grandstand', 'merch-stand', 'food-court', 'main-gate']"
    misconception: path-needs-no-reverse
    feedback: "That's the order the notes are followed in, goal first. `[::-1]` turns the list round, so the route starts at the main gate."
  - text: "['main-gate', 'food-court', 'fan-zone', 'merch-stand', 'grandstand']"
    misconception: path-includes-every-place
    feedback: "The route only has the places on the way. The fan zone was reached too, but no note on the way back from the grandstand points at it."
---
Notes left by a search from the main gate.
