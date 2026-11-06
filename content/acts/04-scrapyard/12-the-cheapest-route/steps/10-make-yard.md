---
id: make-yard
type: make
title: Make the car park planner
files: [planner.py]
entry: planner.py
timeout_ms: 15000
on_pass: { neil.surprised.cheer: "Twenty-three minutes, and the arrows go where I'd have walked. Now I know why." }
hints:
  nudge: "Your quickest route round the circuit kept `(minutes, place)` on its heap. What does A* put first instead, and where do a tile's neighbours come from now?"
  plan:
    - "manhattan: rows apart plus columns apart"
    - "a_star: Dijkstra from the circuit, with the start's estimate on the heap to begin with"
    - "Take the waiting tile with the smallest minutes plus estimate; skip it if it's settled"
    - "If it's the goal, follow came_from back and hand back the minutes and the route"
    - "For each neighbour: if this way is quicker, note the minutes and where it came from, and push (minutes + estimate, estimate, neighbour)"
    - "draw_route: the car park as letters, an arrow on each route tile but the last, and G on the last"
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
The route planner's second half, for the car park, in `planner.py`. `read_park` and `neighbours` are written: the maze solver's, with a cost on every tile, `None` for hedge. Paul's `show_search` draws the car park as a grid. Write `manhattan`, `a_star` and `draw_route`; the main block prints what the brief shows.

```
Gate to car: 23 minutes, 19 steps
v.....#.......#.....
v####.#.~~~~~.#.###.
```

`a_star` is your `quickest_route` with three changes: tiles for places, `neighbours` for roads, and a heap ordered by minutes plus estimate. Run it after each piece.

Inside your search loop, call `show_search(tiles, best, tile, goal)`, and once more with the route at the end, then press Run: the minutes spread towards the car, and the route comes up as arrows.

The hidden checks wall the car off, plant it in a hedge, try mud worth wading and mud worth avoiding, routes that tie and a car park of 2,500 tiles, and count the tiles your search looks round.
