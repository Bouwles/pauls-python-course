---
id: make
type: make
title: Make Riya's quickest routes
files: [routes.py]
entry: routes.py
on_pass: { riya: "Fourteen minutes to the theatre, and it knew before I'd found my keys." }
hints:
  nudge: "In `quickest_times`, a place can come off the heap more than once. Which time counts, and what should happen the other times?"
  plan:
    - "route_minutes: add up the minutes for each pair of places next to each other, raising ValueError for a missing road"
    - The start is 0 minutes away; nothing is settled yet
    - While anywhere is waiting, take the nearest waiting place
    - Settled already? Then this is an old entry, so skip it; otherwise settle it
    - "Down each road: if this way is quicker, note the minutes and put it in waiting"
    - "quickest_route: the same, plus a note of where each place's best minutes came from, and stop when the goal is settled"
  shape: |
    def quickest_route(roads, start, goal):
        best = {start: 0}
        came_from = {start: None}
        settled = set()
        waiting = [(0, start)]
        while waiting:
            minutes, place = heapq.heappop(waiting)
            if place in settled:
                ___
            settled.add(place)
            if place == goal:
                ...
                return minutes, route
            for neighbour, road in roads.get(place, {}).items():
                if neighbour not in best or ___ < best[neighbour]:
                    best[neighbour] = ___
                    came_from[neighbour] = ___
                    heapq.heappush(waiting, (best[neighbour], neighbour))
        return None
---
Write the three functions from the brief in `routes.py`. `quickest_times` has Paul's subgoals in it already.

`quickest_route` is `quickest_times` with two additions you've met before: Yahya's `came_from`, noted whenever a place's minutes improve, and a stop as soon as the goal is settled, because nothing later can beat it.

Add `show_graph(roads, visited=settled, frontier=[name for _, name in waiting], current=place, distances=best)` inside your loop, and `show_graph(roads, path=route, distances=best)` once you have the route, then press Run.

The hidden checks send you round triangles, down one-way roads and over a road that takes no time at all, and count how often your code goes through a place's roads in a city of nine hundred.
