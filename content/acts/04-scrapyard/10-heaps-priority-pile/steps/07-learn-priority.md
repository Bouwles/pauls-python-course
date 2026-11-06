---
id: learn-priority
type: learn
title: Most urgent, then first come
concept: priority-queues
code: |
  import heapq

  waiting = []
  arrival = 0
  for priority, job in [(2, "tyres"), (2, "chain"), (1, "steering bolt")]:
      heapq.heappush(waiting, (priority, arrival, job))
      arrival = arrival + 1

  while waiting:
      print(heapq.heappop(waiting))
---
A **priority queue** hands back the most urgent item next, whatever order things arrived in. A heap is one, if each item starts with its priority: a tuple like `(1, "steering bolt")`, where 1 is the most urgent.

Tuples compare item by item: first the priorities, and only if they tie, the next thing along. So two jobs at priority 2 would be decided by their names, alphabetically. That isn't fair to the one that came first.

The fix is a count of arrivals in the middle: `(priority, arrival, job)`. Arrivals never tie, so the jobs themselves are never compared. The example prints the steering bolt, then `(2, 0, 'tyres')`, then `(2, 1, 'chain')`.

The usual slip is to leave a tie to the job's name.
