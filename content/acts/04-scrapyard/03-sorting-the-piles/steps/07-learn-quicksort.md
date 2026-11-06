---
id: learn-quicksort
type: learn
title: Split round a pivot
concept: quicksort
dialogue:
  - neil.pleased: "The second half: two sorts that are actually quick. Ten thousand laps quick."
code: |
  pile = [5, 8, 2, 5, 1, 9]
  pivot = pile[0]
  faster = [lap for lap in pile if lap < pivot]
  same = [lap for lap in pile if lap == pivot]
  slower = [lap for lap in pile if lap > pivot]
  print(faster, same, slower)
---
**Quicksort** sorts by splitting. Pick one lap, the **pivot**; here it's the first. Faster laps go in one pile, laps the same as the pivot in another, slower laps in a third. The three piles are now in the right order, even if the laps inside each aren't.

Then split each pile of two or more the same way, round after round, until no pile has two laps. Read the piles left to right: sorted.

The example splits `[5, 8, 2, 5, 1, 9]` round the 5 and prints `[2, 1] [5, 5] [8, 9]`.

Each round looks at every lap once, and a jumbled pile takes about log n rounds: O(n log n). The usual slip is to forget the laps that match the pivot.
