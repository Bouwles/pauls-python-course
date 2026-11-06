---
id: predict-round
type: predict
title: Every road to the end
concept: dfs
dialogue:
  - neil.pleased: "How I explore a new circuit. Down a road, keep going, and only turn back when there's nowhere new."
code: |
  ROADS = {
      "campsite": ["main-gate", "car-park"],
      "main-gate": ["campsite", "fan-zone", "food-court"],
      "fan-zone": ["main-gate"],
      "food-court": ["main-gate", "car-park"],
      "car-park": ["campsite", "food-court"],
  }
  order = []


  def explore(place):
      order.append(place)
      for neighbour in ROADS[place]:
          if neighbour not in order:
              explore(neighbour)


  explore("campsite")
  print(order)
question: What does this print?
options:
  - text: "['campsite', 'main-gate', 'fan-zone', 'food-court', 'car-park']"
    correct: true
    feedback: "Right. From the main gate it goes to the fan zone, a dead end, so it comes back and takes the main gate's next road, to the food court, and on to the car park from there."
  - text: "['campsite', 'main-gate', 'car-park', 'fan-zone', 'food-court']"
    misconception: dfs-goes-by-distance
    feedback: "That's nearest first, breadth first. `explore` doesn't wait to finish the campsite's roads: it follows the main gate all the way down before it ever looks at the car park."
  - text: "['campsite', 'main-gate', 'fan-zone']"
    misconception: dfs-stops-at-dead-end
    feedback: "The fan zone is a dead end, but that only ends the call for the fan zone. The main gate's loop carries on with its next road, the food court."
  - text: A RecursionError
    misconception: dfs-loops-forever
    error: RecursionError
    feedback: "Every road goes both ways, but `neighbour not in order` stops it going back to anywhere it has already been. Each place is explored once."
after: |
  Run it, then press Step through and watch the tower of crates: one crate for each place still waiting to try its next road.
---
`explore` from the last step, on a loop of five places.
