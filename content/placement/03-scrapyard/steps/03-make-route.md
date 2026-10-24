---
id: make-route
type: make
title: The quickest way to the ferry
files: [routes.py]
entry: routes.py
dialogue:
  - nell: "The ferry won't wait for a lorry of scrap. Fewest roads, please. I'll not argue about corners."
on_pass: { nell: "Workshop, post office, harbour office, ferry. Four roads. I'd have gone past the pub." }
---
`TOWN` in `routes.py` is Saltmarsh's roads: each place, and the places one road away. Roads can be one-way, so follow the lists exactly, and a place with no list of its own is a dead end.

1. `shortest_route(roads, start, goal)` gives back the list of places from `start` to `goal` along the fewest roads, `[start]` if they're the same place, or `None` if there's no way there. Where two routes tie, either will do.
2. `roads_away(roads, start)` gives back a dictionary of every place you can reach from `start`, and how many roads away it is. `start` itself is 0.

```
shortest_route(TOWN, "scrapyard", "ferry")
    gives  ["scrapyard", "workshop", "post-office", "harbour-office", "ferry"]
```

The hidden checks hand your functions a town of nine hundred places that counts every place whose roads you look up. Breadth-first search looks each one up once.

To watch it work, call `show_graph` from `saltmarsh` inside your loop.
