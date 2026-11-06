---
id: worked
type: worked
title: How Paul sorts his marking
dialogue:
  - paul.neutral.point: "Last week's tests, marked out of twenty. Highest on top, every time."
code: |
  def highest_first(marks):
      for position in range(1, len(marks)):
          current = marks[position]
          slot = position
          while slot > 0 and marks[slot - 1] < current:
              marks[slot] = marks[slot - 1]
              slot = slot - 1
          marks[slot] = current


  marks = [10, 19, 13, 8, 17]
  highest_first(marks)
  print(marks)
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
  prompt: "Why does Paul put the mark in `current` before any sliding starts?"
  answer: "The first slide copies the mark on its left into its place, over the top of it. Without `current`, the mark being placed would be lost."
  concept: simple-sorts
---
Paul's marks are out of twenty, and he wants the highest first, so the test is the other way round: a mark slides left past every lower one. Otherwise it's the insertion sort you've just seen, as a function.

The labels beside the code are the steps he took. Your `insertion_sort` takes the same steps, and they're in your file as comments. Press Step through and watch each bar slide into place.
