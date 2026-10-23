---
id: worked-merge
type: worked
title: How Moss merges two piles
dialogue:
  - moss: "Two tidy piles into one tidy pile. Easiest job in the yard, done properly."
code: |
  def merge(left, right):
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
      merged.extend(left[next_left:])
      merged.extend(right[next_right:])
      return merged


  print(merge([2, 5, 9], [1, 5, 6, 12]))
subgoals:
  - label: Start an empty pile, and a finger at the front of each
    lines: [2, 4]
  - label: While both piles have parts left
    lines: [5, 5]
  - label: Take the lighter front part; on a tie, take from the left
    lines: [6, 11]
  - label: Tip whatever's left on the end
    lines: [12, 13]
  - label: Hand back the merged pile
    lines: [14, 14]
explain:
  prompt: "When the loop ends, one pile may still have parts in it. Why can Moss tip them straight on the end?"
  answer: "That pile was sorted already, and everything left in it is at least as heavy as everything merged so far. So the leftovers go on the end in the order they're in."
  concept: merge-sort
---
Merging two sorted piles is quick: look at the front of each, take the lighter, repeat. Each part is looked at once, so it's O(n).

**Merge sort** is built on it. Start with every part as a pile of one, which is sorted already. Merge neighbours in pairs: piles of two. Merge again: piles of four. Keep going until there's one pile. With n parts that's about log n rounds of O(n) merging, so O(n log n), whatever order the parts arrived in.
