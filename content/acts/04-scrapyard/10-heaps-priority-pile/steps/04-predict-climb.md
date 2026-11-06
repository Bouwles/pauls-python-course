---
id: predict-climb
type: predict
title: A 0 comes in
concept: heaps
code: |
  heap = [1, 3, 2, 6, 4]
  heap.append(0)
  position = len(heap) - 1
  while position > 0:
      parent = (position - 1) // 2
      if heap[parent] <= heap[position]:
          break
      heap[position], heap[parent] = heap[parent], heap[position]
      position = parent
  print(heap)
question: What does this print?
options:
  - text: "[0, 3, 1, 6, 4, 2]"
    correct: true
    feedback: "Right. The 0 starts at position 5. Its parent, at 2, holds 2: swap. Its new parent, at 0, holds 1: swap. Only the items on its path moved."
  - text: "[0, 1, 2, 3, 4, 6]"
    misconception: heap-list-is-sorted
    feedback: "A climb doesn't sort the list. It only swaps the new item with its parent, then its parent's parent. The 3, 6 and 4 never move."
  - text: "[1, 3, 2, 6, 4, 0]"
    misconception: heappush-just-appends
    feedback: "Appending is only the start. The `while` loop swaps the 0 with each parent bigger than it, until it reaches the top."
---
The climb from the last step, on a different heap.
