---
id: learn-merge
type: learn
title: Two tidy piles into one
concept: merge-sort
code: |
  left = [2, 5, 9]
  right = [1, 6]
  merged = []
  next_left = 0
  next_right = 0
  while next_left < len(left) and next_right < len(right):
      if left[next_left] <= right[next_right]:
          merged.append(left[next_left])
          next_left = next_left + 1
      else:
          merged.append(right[next_right])
          next_right = next_right + 1
      print(merged)
  print(merged + left[next_left:] + right[next_right:])
---
**Merging** joins two piles that are each in order into one. Put a finger on the front lap of each, take the faster, move that finger on, and repeat. When one pile runs out, tip the rest of the other on the end. Each lap is looked at once: O(n).

**Merge sort** is built on it. Every lap starts as a pile of one, which is in order already. Merge neighbours in pairs to get piles of two, then four, until one pile is left: about log n rounds of O(n) merging, so O(n log n).

The example prints `merged` after each take, then the finished `[1, 2, 5, 6, 9]`.

The usual slip is to expect the loop to empty both piles. It stops when either runs out.
