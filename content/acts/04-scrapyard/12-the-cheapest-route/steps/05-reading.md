---
id: reading
type: reading
title: Dijkstra, with a sense of direction
dialogue:
  - riya: "I don't search the whole park to get to the cafe. I head for it."
code: |
  def manhattan(tile, goal):
      return abs(tile[0] - goal[0]) + abs(tile[1] - goal[1])


  # What goes on the heap for a tile reached in `minutes` so far:
  # (minutes + manhattan(tile, goal), manhattan(tile, goal), tile)
---
Dijkstra's algorithm spreads out from the gate in every direction at once. Most of that work happens behind the gate, nowhere near the cafe.

**A\*** (say "A star") orders the waiting tiles by a guess at the whole trip: the minutes spent so far, `g`, plus an estimate of the minutes still to go, `h`. Take the tile with the smallest `g + h`, and the search leans towards the goal.

For `h`, use the **Manhattan distance**: rows apart plus columns apart. No tile costs less than a minute, so the real trip can never be shorter than that. An estimate that never overestimates keeps A* honest: when it settles the goal, it has the quickest route.

If two tiles tie on `g + h`, take the one nearer the goal first: put `h` second in the tuple.

Everything else is Dijkstra, as you wrote it for the city.
