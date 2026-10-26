---
id: worked
type: worked
title: How Moss sorts his spanners
dialogue:
  - moss: "My spanners. Biggest on the left. Has been since 1974."
code: |
  def biggest_first(spanners):
      for position in range(1, len(spanners)):
          current = spanners[position]
          slot = position
          while slot > 0 and spanners[slot - 1] < current:
              spanners[slot] = spanners[slot - 1]
              slot = slot - 1
          spanners[slot] = current


  spanners = [10, 19, 13, 8, 17]
  biggest_first(spanners)
  print(spanners)
subgoals:
  - label: Take each one in turn, from the second
    lines: [2, 2]
  - label: Pick it up
    lines: [3, 4]
  - label: While the one to its left belongs after it, move that one right
    lines: [5, 7]
  - label: Put it down in the gap
    lines: [8, 8]
explain:
  prompt: "Why does Moss put the spanner in `current` before any sliding starts?"
  answer: "The first slide copies the spanner on its left into its place, over the top of it. Without `current`, the spanner being placed would be lost."
  concept: simple-sorts
---
**Insertion sort** is how people sort a hand of cards. Take each one in turn and slide it left past everything that belongs after it. Everything to its left is in order already, so it stops as soon as it meets one that belongs before it.

Moss's spanner sizes are in millimetres, and he wants the biggest first. Press Step through and watch each bar slide into place.
