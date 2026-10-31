---
id: predict-round
type: predict
title: Every road to the end
concept: dfs
dialogue:
  - yahya: "My long run. Down a road, keep going, and only turn back when there's nowhere new."
code: |
  ROADS = {
      "market": ["clocktower", "museum"],
      "clocktower": ["market", "cafe", "bookshop"],
      "cafe": ["clocktower"],
      "bookshop": ["clocktower", "museum"],
      "museum": ["market", "bookshop"],
  }
  order = []


  def explore(place):
      order.append(place)
      for neighbour in ROADS[place]:
          if neighbour not in order:
              explore(neighbour)


  explore("market")
  print(order)
question: What does this print?
options:
  - text: "['market', 'clocktower', 'cafe', 'bookshop', 'museum']"
    correct: true
    feedback: "Right. From the Clocktower it goes to the cafe, a dead end, so it comes back and takes the Clocktower's next road, to the bookshop, and on to the museum from there."
  - text: "['market', 'clocktower', 'museum', 'cafe', 'bookshop']"
    misconception: dfs-goes-by-distance
    feedback: "That's nearest first, breadth first. `explore` doesn't wait to finish the market's roads: it follows the Clocktower all the way down before it ever looks at the museum."
  - text: "['market', 'clocktower', 'cafe']"
    misconception: dfs-stops-at-dead-end
    feedback: "The cafe is a dead end, but that only ends the call for the cafe. The Clocktower's loop carries on with its next road, the bookshop."
  - text: A RecursionError
    misconception: dfs-loops-forever
    error: RecursionError
    feedback: "Every road goes both ways, but `neighbour not in order` stops it going back to anywhere it has already been. Each place is explored once."
after: |
  Run it, then press Step through and watch the tower of crates: one crate for each place still waiting to try its next road.
---
Following each road as far as it goes before trying the next is **depth-first search**, or DFS. A function that calls itself for each new neighbour does it: the calls waiting underneath remember where to come back to.
