---
id: learn-climb
type: learn
title: A tree kept in a list
concept: heaps
code: |
  heap = [2, 4, 3, 7, 9]
  heap.append(1)
  position = len(heap) - 1
  while position > 0:
      parent = (position - 1) // 2
      if heap[parent] <= heap[position]:
          break
      heap[position], heap[parent] = heap[parent], heap[position]
      position = parent
      print(heap)
---
Inside, a heap is a tree kept in a list. Position 0 is the top. The item at `position` has up to two children, at `2 * position + 1` and `2 * position + 2`, and its parent is at `(position - 1) // 2`.

```text
            heap[0]
          /         \
     heap[1]       heap[2]
     /     \        /
 heap[3] heap[4] heap[5]
```

The one rule: every parent belongs above its children. In `heapq`'s heap, that means no parent is bigger than its children.

To push, put the new item at the bottom, the end of the list, and let it **climb**: while it belongs above its parent, swap them. The example climbs a 1 to the top in two swaps.

A thousand items are only about ten levels deep, so a climb is O(log n). The usual slip is to expect a push to sort the list. Only the items on one path move.
