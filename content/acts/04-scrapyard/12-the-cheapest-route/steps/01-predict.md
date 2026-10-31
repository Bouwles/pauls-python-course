---
id: predict
type: predict
title: Minutes, not roads
concept: weighted-graphs
code: |
  MINUTES = {
      "market": {"clocktower": 8, "bookshop": 4},
      "clocktower": {"market": 8, "cafe": 2, "bookshop": 3},
      "cafe": {"clocktower": 2, "station": 2, "library": 3},
      "bookshop": {"market": 4, "clocktower": 3, "library": 2},
      "library": {"bookshop": 2, "cafe": 3, "city-hall": 2},
      "city-hall": {"library": 2, "station": 2},
      "station": {"cafe": 2, "city-hall": 2, "theatre": 4},
      "theatre": {"station": 4},
  }


  def minutes(route):
      total = 0
      for here, there in zip(route, route[1:]):
          total = total + MINUTES[here][there]
      return total


  print(minutes(["market", "clocktower", "cafe", "station", "theatre"]))
  print(minutes(["market", "bookshop", "library", "city-hall", "station", "theatre"]))
question: What does this print?
options:
  - text: |-
      16
      14
    correct: true
    feedback: "Right. The first route has fewer roads, but one of them is the eight-minute road from the market. The second is a road longer and two minutes quicker."
  - text: |-
      4
      5
    misconception: weighted-route-counts-roads
    feedback: "That counts the roads. `MINUTES[here][there]` is the minutes on the road from here to there, and those are what get added up."
  - text: A KeyError
    misconception: zip-pairs-wrap-round
    error: KeyError
    feedback: "`zip` stops when the shorter list runs out. `route[1:]` is one shorter, so the last pair is the station and the theatre, and nothing pairs the theatre with the market."
after: |
  Run it. Then work out the minutes for `["market", "bookshop", "clocktower"]` and check them against the direct road.
---
Riya's map now says how long each road takes. Each place has a dictionary of its neighbours instead of a list, and each neighbour has the minutes it takes to get there. A graph with numbers on its roads is a **weighted graph**.

`zip(route, route[1:])` pairs each place with the next one along.
