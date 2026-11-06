---
id: predict-sink
type: predict
title: Which child?
concept: heaps
code: |
  heap = [1, 5, 2, 6, 7, 3]
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
  print(smallest, heap)
question: What does this print?
options:
  - text: "1 [2, 5, 3, 6, 7]"
    correct: true
    feedback: "Right. The 3 moves to the top. Its children are 5 and 2, and the smaller is 2, so they swap. At position 2 the 3 has no children, so it stops."
  - text: "1 [5, 3, 2, 6, 7]"
    misconception: heap-sink-either-child
    feedback: "Swapping with the left child, the 5, would put 5 on top, above the 2. A sinking item swaps with the smaller child, so the top ends up smallest."
  - text: "1 [2, 3, 5, 6, 7]"
    misconception: heap-list-is-sorted
    feedback: "A pop doesn't sort what's left. Only the 3 and the 2 swap; the 5, 6 and 7 stay where they were."
---
The same sinking, on a bigger heap.
