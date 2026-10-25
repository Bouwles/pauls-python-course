---
id: make
type: make
title: Make the Scrapyard Route Planner
files: [planner.py]
entry: planner.py
timeout_ms: 15000
on_pass: { nell: "Twenty-three minutes, and the arrows go exactly where I'd have walked. I just never knew why." }
hints:
  nudge: "Your quickest route for the lorry kept `(minutes, place)` on its heap. What does A* put first instead, and where do a tile's neighbours come from now?"
  plan:
    - "read_yard: a row of costs for each line that isn't blank, noting where S and G are, then check the map"
    - "neighbours: the four tiles round it, kept if they're inside the yard and not scrap"
    - "a_star: Dijkstra from the lorry job, with the start's estimate on the heap to begin with"
    - "Take the waiting tile with the smallest minutes plus estimate; skip it if it's settled"
    - "If it's the goal, follow came_from back and hand back the minutes and the route"
    - "For each neighbour: if this way is quicker, note the minutes and where it came from, and push (minutes + estimate, estimate, neighbour)"
    - "draw_route: the yard as letters, an arrow on each route tile but the last, and G on the last"
  shape: |
    def a_star(tiles, start, goal):
        best = {start: 0}
        came_from = {start: None}
        settled = set()
        waiting = [(manhattan(start, goal), manhattan(start, goal), start)]
        while waiting:
            _, _, tile = heapq.heappop(waiting)
            if tile in settled:
                continue
            settled.add(tile)
            if tile == goal:
                ...
            for neighbour in neighbours(tiles, tile):
                minutes = best[tile] + tiles[___][___]
                if neighbour not in best or minutes < best[neighbour]:
                    best[neighbour] = minutes
                    came_from[neighbour] = tile
                    estimate = ___
                    heapq.heappush(waiting, (___, estimate, neighbour))
        return None
---
`planner.py` has Penhallow's note, the main block's first lines, and Moss's `show_search`, which draws the yard with Sir Reginald's grid. Write the five functions from the brief, then finish the main block so it prints what the brief shows.

Build it a piece at a time, and run it after each: read the map and print `tiles`, then `neighbours` of the gate, then the search.

Inside your search loop, call `show_search(tiles, best, tile, goal)`, and once more with the route at the end, then press Run. The minutes spread across the yard towards the crane, and the route comes up as arrows.

The hidden checks try maps with mistakes in, cranes walled off and buried in scrap, mud worth wading and mud worth avoiding, routes that tie, a yard of 2,500 tiles, and count how many tiles your search looks round on the way.
