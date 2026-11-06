---
id: learn-heap
type: learn
title: Smallest on top
concept: heaps
code: |
  import heapq

  pile = []
  for job in [5, 2, 7]:
      heapq.heappush(pile, job)
  print(heapq.heappop(pile))
  print(heapq.heappop(pile))
---
A **heap** is a pile that always keeps its smallest item at the front, however many items come and go. Python's `heapq` module keeps a plain list as a heap. `heapq.heappush(pile, item)` adds an item, and `heapq.heappop(pile)` takes the smallest away and hands it back.

That's what a pit crew needs on race day: whatever's most urgent, next. Each push or pop costs O(log n), far less than sorting the whole pile every time a job comes in.

The example pushes 5, 2 and 7, then pops twice. It prints `2`, then `5`.

The usual slip is to expect the list to be sorted. A heap only promises the front. Add `print(pile)` after the loop to see.
