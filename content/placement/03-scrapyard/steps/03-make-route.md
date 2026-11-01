---
id: make-route
type: make
title: The quickest way to the park
files: [routes.py]
entry: routes.py
dialogue:
  - caitlin.pleased.wave: "Gym to the park, fewest roads. I don't care about corners. I care about roads."
on_pass: { caitlin.laughing.cheer: "Gym, Clocktower, station, bridge, park. Four roads. That's my new warm-up." }
---
`CITY` in `routes.py` is the roads round the Clocktower: each place, and the places one road away. Roads can be one-way, so follow the lists exactly, and a place with no list of its own is a dead end.

1. `shortest_route(roads, start, goal)` gives back the list of places from `start` to `goal` along the fewest roads, `[start]` if they're the same place, or `None` if there's no way there. Where two routes tie, either will do.
2. `roads_away(roads, start)` gives back a dictionary of every place you can reach from `start`, and how many roads away it is. `start` itself is 0.

```
shortest_route(CITY, "gym", "park")
    gives  ["gym", "clocktower", "station", "bridge", "park"]
```

The hidden checks hand your functions a city of nine hundred places that counts every place whose roads you look up. Breadth-first search looks each one up once.

To watch it work, call `show_graph` from `workshop` inside your loop.
