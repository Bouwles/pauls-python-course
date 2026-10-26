---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "A heap, like Moss's. Each place gets its minutes the first time I see it, like breadth first."
  - pip: "Eight minutes to the workshop, straight there. Nell says seven, round by the tailor's. That's further."
dialogue_after:
  - pip: "In breadth first, the first time you see a place is the best. With minutes on the roads, it isn't."
hints:
  nudge: "Pip reaches the workshop from the scrapyard first, at 8 minutes. What happens when the tailor's turns up, with a road there that makes it 7?"
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
Pip's `quickest_route` gives back the minutes and the route, and walks the route back with `came_from`, as in the road map. Run it.

Then add `show_graph(roads, visited=best, current=place, distances=best)` inside the loop and watch the workshop get its minutes, and keep them.

The checks send the lorry all over town, round a triangle where the direct road is the slow one, and nowhere at all.
