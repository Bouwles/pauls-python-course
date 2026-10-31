---
id: pips
type: pips
title: Fix Caitlin's version
dialogue:
  - caitlin: "Can you look at mine? A heap, like Paul's. Each place keeps the minutes I first see it with."
  - caitlin: "Eight minutes to the Clocktower, straight there. Riya says seven, round by the bookshop. That's further."
dialogue_after:
  - caitlin: "In breadth first, the first time you see a place is the best. With minutes on the roads, it isn't."
hints:
  nudge: "Caitlin reaches the Clocktower from the market first, at 8 minutes. What happens when the bookshop turns up, with a road there that makes it 7?"
  plan:
    - Let a quicker way to a place replace the minutes and the note of where it came from
    - Put the place back on the heap with its new minutes
    - Skip an entry that comes off the heap after its place is settled
  shape: |
    while waiting:
        minutes, place = heapq.heappop(waiting)
        if place in ___:
            continue
        settled.add(place)
        ...
        for neighbour, road in roads.get(place, {}).items():
            if neighbour not in best or ___ < best[neighbour]:
                best[neighbour] = minutes + road
                came_from[neighbour] = place
                heapq.heappush(waiting, (___, neighbour))
---
Caitlin's `quickest_route` gives back the minutes and the route, and walks the route back with `came_from`, as in the road map. Run it.

Then add `show_graph(roads, visited=best, current=place, distances=best)` inside the loop and watch the Clocktower get its minutes, and keep them.

The checks send Riya all over the city, round a triangle where the direct road is the slow one, and nowhere at all.
