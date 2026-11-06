---
id: learn-weighted
type: learn
title: Minutes on the roads
concept: weighted-graphs
code: |
  MINUTES = {
      "campsite": {"main-gate": 8, "food-court": 4},
      "food-court": {"campsite": 4, "main-gate": 3},
      "main-gate": {"campsite": 8, "food-court": 3},
  }


  def minutes(route):
      total = 0
      for here, there in zip(route, route[1:]):
          total = total + MINUTES[here][there]
      return total


  print(minutes(["campsite", "main-gate"]))
  print(minutes(["campsite", "food-court", "main-gate"]))
---
A **weighted graph** has a number on every road: here, the minutes it takes on foot. Picture the string on the Puzzle Room wall with a label on each piece.

Each place now has a dictionary of neighbours instead of a list, and each neighbour has its minutes: `MINUTES["campsite"]["food-court"]` is 4.

To time a route, add the minutes on each road along it. `zip(route, route[1:])` pairs each place with the next: `route[1:]` is the route without its first place, and `zip` stops when the shorter runs out.

The example times two ways from the campsite to the main gate. Direct takes `8`; round by the food court takes `7`.

The usual slip is to think the fewest roads is the quickest. With minutes on the roads, often it isn't.
