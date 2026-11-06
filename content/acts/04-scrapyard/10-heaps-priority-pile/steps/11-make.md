---
id: make
type: make
title: Make the task scheduler
files: [scheduler.py]
entry: scheduler.py
on_pass: { neil.proud.thumbs: "A thousand jobs and it knows what's next in ten looks. I'd have done the wrong one first." }
hints:
  nudge: "After `pop` moves the last item up to the top, it's probably too big for there. Which of its two children should take its place?"
  plan:
    - "push: put it at the bottom"
    - While it isn't at the top, find its parent
    - If the parent belongs above it, stop; otherwise swap them, and climb
    - "pop: keep the top to hand back, then move the last item up into its place"
    - While a child belongs above it, swap it with the one that belongs highest, and sink
    - "TaskScheduler: a list for the heap, a count of arrivals, and (priority, arrival, job) on it"
  shape: |
    def push(heap, item):
        heap.append(item)
        position = len(heap) - 1
        while position > 0:
            parent = ___
            if heap[parent] <= heap[position]:
                break
            heap[position], heap[parent] = ___, ___
            position = parent


    def pop(heap):
        smallest = heap[0]
        last = heap.pop()
        if heap:
            heap[0] = last
            position = 0
            while True:
                smaller = position
                for child in (___, ___):
                    if child < len(heap) and heap[child] < heap[smaller]:
                        smaller = child
                if smaller == position:
                    break
                heap[position], heap[smaller] = heap[smaller], heap[position]
                position = ___
        return smallest
---
Write `push` and `pop` in `scheduler.py`, smallest on top, then `TaskScheduler` on top of them. No `heapq` in this file: the scheduler is yours.

```
Fixing the loose steering bolt
Fixing the brake pads
...
Still waiting: 1
```

`push` and `pop` are Paul's `add_job` and `take_job` the other way up: here, "belongs above" means smaller. Paul's labels are in your file. An empty heap's `pop` raises `IndexError`, as `[][0]` already does.

`TaskScheduler` uses "Most urgent, then first come": `(priority, arrival, job)` on the heap, and `take` hands back only the job. `__len__` gives `len(scheduler)`.

Press Step through on a heap of numbers to watch the bars climb and sink. The hidden checks pop every shape of heap, and count each comparison your `push` and `pop` make on a thousand items.
