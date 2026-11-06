---
id: learn-sink
type: learn
title: Taking the top
concept: heaps
code: |
  heap = [1, 2, 3, 7, 4]
  smallest = heap[0]
  heap[0] = heap.pop()
  position = 0
  while True:
      smaller = position
      for child in (2 * position + 1, 2 * position + 2):
          if child < len(heap) and heap[child] < heap[smaller]:
              smaller = child
      if smaller == position:
          break
      heap[position], heap[smaller] = heap[smaller], heap[position]
      position = smaller
      print(heap)
  print(smallest, heap)
---
To pop, hand back `heap[0]`. That leaves a hole at the top. Fill it with the last item in the list, then let that item **sink**: while one of its children belongs above it, swap it with the child that belongs highest. In `heapq`'s heap, that's the smaller child.

It has to be the smaller one. Swap with the bigger child and it would sit above the smaller, breaking the rule.

The example takes the 1 off the top. The 4 moves up from the end, swaps with the 2, and stops above the 7. It prints `[2, 4, 3, 7]`, then `1 [2, 4, 3, 7]`.

Sinking is one path down, so O(log n). The usual slip is the last parent: it can have a left child and no right one, so check each child's position against `len(heap)`.
