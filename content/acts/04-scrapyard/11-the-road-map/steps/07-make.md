---
id: make
type: make
title: Make the maze solver
files: [maze.py]
entry: maze.py
on_pass: { nell: "Nineteen steps, gate to crane. And a patch behind the old boiler nobody's stood on since the pier lot." }
hints:
  nudge: "Moss's walk took places from a dictionary of roads. Here the roads come from `neighbours`. What else changes in `shortest_path`, apart from that?"
  plan:
    - "neighbours: up, down, left, right; keep the ones inside the maze that aren't walls"
    - "shortest_path: mark the start as reached, and queue it"
    - While anything is queued, take the tile at the front and look at each neighbour
    - "If it's somewhere new: note where it was reached from, and queue it"
    - When the goal comes off the queue, follow the notes back and turn the list round
    - "explore: a function inside it that notes a tile, then visits each new neighbour in turn"
    - "unreachable: every open tile, row by row, that explore didn't reach"
    - "draw_path: each line again, with * where the path crosses an open tile"
  shape: |
    def shortest_path(grid, start, goal):
        came_from = {start: None}
        queue = deque([start])
        while queue:
            tile = queue.popleft()
            if tile == goal:
                path = []
                while tile is not None:
                    path.append(tile)
                    tile = ___
                return path[::-1]
            for neighbour in neighbours(grid, ___):
                if neighbour not in came_from:
                    came_from[neighbour] = ___
                    queue.append(___)
        return None
---
Write the five functions from the brief in `maze.py`. `read_maze` and the main block are written, and the yard is in `maze.txt`.

```
Gate to crane: 19 steps
S.....#.......#.....
*####.#.......#.###.
```

`shortest_path` is Pip's fixed search with tiles for places and `neighbours` for the roads. `explore` is Penhallow's round from the predict, on tiles. The round reaches everything that can be reached, so `unreachable` is whatever it misses.

The main block draws the solved maze with `show_grid`; for the search itself, call `show_grid` inside your loop each time a tile comes off the queue and press Run. The hidden checks solve mazes with no way through, two ways round, and a field thirty tiles square.
