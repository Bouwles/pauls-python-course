---
id: predict
type: predict
title: Which tile next
concept: a-star
code: |
  import heapq


  def manhattan(tile, goal):
      return abs(tile[0] - goal[0]) + abs(tile[1] - goal[1])


  goal = (0, 4)
  waiting = []
  for tile, minutes_so_far in [((2, 0), 1), ((1, 3), 6), ((0, 1), 3)]:
      heapq.heappush(waiting, (minutes_so_far + manhattan(tile, goal), tile))
  print(heapq.heappop(waiting))
question: What does this print?
options:
  - text: "(6, (0, 1))"
    correct: true
    feedback: "Right. 3 minutes so far and 3 to go at best: 6 in all. The tile by the goal has cost too much to get to, and the cheap one is pointing the wrong way."
  - text: "(8, (1, 3))"
    misconception: a-star-greedy-to-goal
    feedback: "That tile is nearest the goal, but it took 6 minutes to reach. A* adds what's been spent to what's left: 6 + 2 is 8, which isn't the smallest."
  - text: "(7, (2, 0))"
    misconception: a-star-cheapest-so-far
    feedback: "That was the cheapest to reach, which is all Dijkstra looks at. A* adds the 6 tiles still between it and the goal: 7, against 6 for (0, 1)."
after: |
  Run it. Then change the goal to `(2, 4)` and work out which tile comes first before you run it again.
---
Three tiles are waiting, each with the minutes it took to reach. A* pushes each one with its minutes so far plus the Manhattan distance still to go.
