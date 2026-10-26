---
id: predict
type: predict
title: Minutes, not roads
concept: weighted-graphs
code: |
  MINUTES = {
      "scrapyard": {"workshop": 8, "tailor": 4},
      "workshop": {"scrapyard": 8, "bakery": 2, "tailor": 3},
      "bakery": {"workshop": 2, "post-office": 2, "library": 3},
      "tailor": {"scrapyard": 4, "workshop": 3, "library": 2},
      "library": {"tailor": 2, "bakery": 3, "town-hall": 2},
      "town-hall": {"library": 2, "post-office": 2},
      "post-office": {"bakery": 2, "town-hall": 2, "ferry": 4},
      "ferry": {"post-office": 4},
  }


  def minutes(route):
      total = 0
      for here, there in zip(route, route[1:]):
          total = total + MINUTES[here][there]
      return total


  print(minutes(["scrapyard", "workshop", "bakery", "post-office", "ferry"]))
  print(minutes(["scrapyard", "tailor", "library", "town-hall", "post-office", "ferry"]))
question: What does this print?
options:
  - text: |-
      16
      14
    correct: true
    feedback: "Right. The first route has fewer roads, but one of them is the eight-minute yard track. The second is a road longer and two minutes quicker."
  - text: |-
      4
      5
    misconception: weighted-route-counts-roads
    feedback: "That counts the roads. `MINUTES[here][there]` is the minutes on the road from here to there, and those are what get added up."
  - text: A KeyError
    misconception: zip-pairs-wrap-round
    error: KeyError
    feedback: "`zip` stops when the shorter list runs out. `route[1:]` is one shorter, so the last pair is the post office and the ferry, and nothing pairs the ferry with the scrapyard."
after: |
  Run it. Then work out the minutes for `["scrapyard", "tailor", "workshop"]` and check them against the direct road.
---
Nell's map now says how long each road takes. Each place has a dictionary of its neighbours instead of a list, and each neighbour has the minutes it takes to get there. A graph with numbers on its roads is a **weighted graph**.

`zip(route, route[1:])` pairs each place with the next one along.
