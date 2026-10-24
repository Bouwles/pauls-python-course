---
id: make
type: make
title: Make Nell's priority pile
files: [pile.py]
entry: pile.py
on_pass: { nell: "A thousand repairs and it still knows which is next, in ten looks. I'd need the afternoon." }
hints:
  nudge: "After `pop` moves the last item up to the top, it's probably too big for there. Which of its two children should take its place?"
  plan:
    - "push: put it at the bottom"
    - While it isn't at the top, find its parent
    - If the parent is no bigger, stop; otherwise swap them, and climb
    - "pop: keep the top to hand back, then move the last item up into its place"
    - While it has a child smaller than itself, swap it with the smaller child, and sink
    - "RepairPile: a list for the heap, a count of arrivals, and (priority, arrival, repair) on it"
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
Write `push` and `pop` in `pile.py`, smallest on top, then `RepairPile` on top of them. No `heapq` in this file: the pile is yours.

`push` is Moss's `add_job` the other way up. Climb while you're smaller than your parent.

`pop` hands back `heap[0]`. To fill the hole, move the last item to the top and let it sink: while one of its children is smaller, swap it with the smaller of the two. An item can have a child at `2 * position + 1` and none at `2 * position + 2`, so check each against `len(heap)`.

`RepairPile` keeps Pip's fix: priority, then arrival, then the repair.

Press Step through on a heap of numbers and watch the bars climb and sink. The hidden checks pop every shape of heap, and count each comparison your `push` and `pop` make on a thousand parts.
