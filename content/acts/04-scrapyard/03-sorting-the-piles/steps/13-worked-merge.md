---
id: worked-merge
type: worked
title: How Paul merges two piles
dialogue:
  - paul.pleased: "Two tidy piles into one tidy pile. Easiest job in the building, done properly."
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
  - label: While both piles have laps left
    lines: [5, 5]
  - label: Take the faster front lap; on a tie, take from the left
    lines: [6, 11]
  - label: Tip whatever's left on the end
    lines: [12, 13]
  - label: Hand back the merged pile
    lines: [14, 14]
explain:
  prompt: "When the loop ends, one pile may still have laps in it. Why can Paul tip them straight on the end?"
  answer: "That pile was sorted already, and everything left in it is at least as slow as everything merged so far. So the leftovers go on the end in the order they're in."
  concept: merge-sort
---
Paul's `merge` is the merge from "Two tidy piles into one", as a function that hands back the merged pile.

The labels beside the code are the steps he took. Your `merge` in `sorter.py` takes the same steps, and they're in your file as comments. One difference: yours compares `key(...)` of the two front items, as `sorted` does with its `key`, not the items themselves.
