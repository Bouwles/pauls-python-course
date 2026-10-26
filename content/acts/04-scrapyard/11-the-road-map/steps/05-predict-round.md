---
id: predict-round
type: predict
title: Every road to the end
concept: dfs
dialogue:
  - nell: "Penhallow's round. Down a road, keep going, and only turn back when there's nowhere new."
code: |
  ROADS = {
      "scrapyard": ["workshop", "records-office"],
      "workshop": ["scrapyard", "bakery", "tailor"],
      "bakery": ["workshop"],
      "tailor": ["workshop", "records-office"],
      "records-office": ["scrapyard", "tailor"],
  }
  order = []


  def explore(place):
      order.append(place)
      for neighbour in ROADS[place]:
          if neighbour not in order:
              explore(neighbour)


  explore("scrapyard")
  print(order)
question: What does this print?
options:
  - text: "['scrapyard', 'workshop', 'bakery', 'tailor', 'records-office']"
    correct: true
    feedback: "Right. From the workshop it goes to the bakery, a dead end, so it comes back and takes the workshop's next road, to the tailor, and on to the records office from there."
  - text: "['scrapyard', 'workshop', 'records-office', 'bakery', 'tailor']"
    misconception: dfs-goes-by-distance
    feedback: "That's nearest first, breadth first. `explore` doesn't wait to finish the scrapyard's roads: it follows the workshop all the way down before it ever looks at the records office."
  - text: "['scrapyard', 'workshop', 'bakery']"
    misconception: dfs-stops-at-dead-end
    feedback: "The bakery is a dead end, but that only ends the call for the bakery. The workshop's loop carries on with its next road, the tailor."
  - text: A RecursionError
    misconception: dfs-loops-forever
    error: RecursionError
    feedback: "Every road goes both ways, but `neighbour not in order` stops it going back to anywhere it has already been. Each place is explored once."
after: |
  Run it, then press Step through and watch Nell's junk tower: one crate for each place still waiting to try its next road.
---
Following each road as far as it goes before trying the next is **depth-first search**, or DFS. A function that calls itself for each new neighbour does it: the calls waiting underneath remember where to come back to.
