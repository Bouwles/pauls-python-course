---
id: predict
type: predict
title: Nearest first
concept: bfs
code: |
  from collections import deque

  ROADS = {
      "workshop": ["bakery", "tailor"],
      "bakery": ["workshop", "post-office"],
      "tailor": ["workshop", "library"],
      "post-office": ["bakery", "library", "ferry"],
      "library": ["tailor", "post-office"],
      "ferry": ["post-office"],
  }

  seen = {"workshop"}
  queue = deque(["workshop"])
  while queue:
      place = queue.popleft()
      print(place)
      for neighbour in ROADS[place]:
          if neighbour not in seen:
              seen.add(neighbour)
              queue.append(neighbour)
question: What does this print?
options:
  - text: |-
      workshop
      bakery
      tailor
      post-office
      library
      ferry
    correct: true
    feedback: "Right. Everything one road away comes out before anything two roads away, because the queue is first in, first out. The ferry is three roads off, so it's last."
  - text: |-
      workshop
      bakery
      post-office
      library
      tailor
      ferry
    misconception: bfs-goes-deep
    feedback: "That follows one road as far as it goes before trying the next. A queue doesn't: the tailor joined the queue before the post office, so it comes out first."
  - text: |-
      workshop
      bakery
      tailor
      post-office
      library
      library
      ferry
    misconception: bfs-queues-twice
    feedback: "Two roads lead to the library, but it goes into `seen` the first time it's queued. The second time, `neighbour not in seen` is False, and it's left alone."
after: |
  Run it. Then add `show_graph(ROADS, visited=seen, frontier=queue, current=place)` just after `print(place)`, with `from workshop import show_graph` at the top, and run it again. Watch the queue spread out from the workshop like a ripple.
---
Searching a graph by taking the nearest places first is called **breadth-first search**, or BFS. It keeps a queue: places go on at the back with `append` and come off the front with `popleft`. A `deque` does both quickly.
