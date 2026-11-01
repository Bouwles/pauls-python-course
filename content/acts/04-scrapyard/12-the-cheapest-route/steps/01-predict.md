---
id: predict
type: predict
title: Minutes, not roads
concept: weighted-graphs
code: |
  MINUTES = {
      "campsite": {"main-gate": 8, "food-court": 4},
      "main-gate": {"campsite": 8, "fan-zone": 2, "food-court": 3},
      "fan-zone": {"main-gate": 2, "paddock": 2, "merch-stand": 3},
      "food-court": {"campsite": 4, "main-gate": 3, "merch-stand": 2},
      "merch-stand": {"food-court": 2, "fan-zone": 3, "grandstand": 2},
      "grandstand": {"merch-stand": 2, "paddock": 2},
      "paddock": {"fan-zone": 2, "grandstand": 2, "hairpin": 4},
      "hairpin": {"paddock": 4},
  }


  def minutes(route):
      total = 0
      for here, there in zip(route, route[1:]):
          total = total + MINUTES[here][there]
      return total


  print(minutes(["campsite", "main-gate", "fan-zone", "paddock", "hairpin"]))
  print(minutes(["campsite", "food-court", "merch-stand", "grandstand", "paddock", "hairpin"]))
question: What does this print?
options:
  - text: |-
      16
      14
    correct: true
    feedback: "Right. The first route has fewer roads, but one of them is the eight-minute road from the campsite. The second is a road longer and two minutes quicker."
  - text: |-
      4
      5
    misconception: weighted-route-counts-roads
    feedback: "That counts the roads. `MINUTES[here][there]` is the minutes on the road from here to there, and those are what get added up."
  - text: A KeyError
    misconception: zip-pairs-wrap-round
    error: KeyError
    feedback: "`zip` stops when the shorter list runs out. `route[1:]` is one shorter, so the last pair is the paddock and the hairpin, and nothing pairs the hairpin with the campsite."
after: |
  Run it. Then work out the minutes for `["campsite", "food-court", "main-gate"]` and check them against the direct road.
---
Neil's map of the circuit now says how long each road takes on foot. Each place has a dictionary of its neighbours instead of a list, and each neighbour has the minutes it takes to get there. A graph with numbers on its roads is a **weighted graph**.

`zip(route, route[1:])` pairs each place with the next one along.
