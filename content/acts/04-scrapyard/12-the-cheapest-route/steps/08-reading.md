---
id: reading
type: learn
title: Dijkstra, with a sense of direction
concept: a-star
dialogue:
  - neil.thinking.point: "I don't search the whole car park to get to my car. I head for it."
code: |
  import heapq


  def manhattan(tile, goal):
      return abs(tile[0] - goal[0]) + abs(tile[1] - goal[1])


  goal = (0, 4)
  print(manhattan((3, 1), goal))

  waiting = []
  for tile, minutes_so_far in [((0, 0), 2), ((0, 3), 3)]:
      estimate = manhattan(tile, goal)
      heapq.heappush(waiting, (minutes_so_far + estimate, estimate, tile))
  print(heapq.heappop(waiting))
---
Dijkstra spreads out in every direction at once. In the car park, most of that work happens behind the gate, nowhere near the car.

**A\*** (say "A star") orders the waiting tiles by a guess at the whole trip: the minutes spent so far plus an estimate of the minutes still to go. Take the smallest, and the search leans towards the goal.

For the estimate, use the **Manhattan distance**: rows apart plus columns apart, like a taxi going round city blocks. No tile costs less than a minute, so the real trip is never shorter. An estimate that never guesses too high keeps A* right: when it settles the goal, it has the quickest route.

On a tie, take the tile nearer the goal: put the estimate second in the tuple. The example prints `6`, then `(4, 1, (0, 3))`.
