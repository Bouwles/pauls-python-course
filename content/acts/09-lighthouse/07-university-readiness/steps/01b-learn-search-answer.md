---
id: learn-search-answer
type: learn
title: Binary search on the answer
concept: binary-search-answer
code: |
  def holds_them(side, tiles):
      """Yes or no: does a square board this many tiles wide hold them all?"""
      return side * side >= tiles


  def smallest_side(tiles):
      low, high = 1, tiles            # the answer is somewhere in here
      checks = 0
      while low < high:
          middle = (low + high) // 2
          checks += 1
          if holds_them(middle, tiles):
              high = middle           # middle works: the answer is middle or smaller
          else:
              low = middle + 1        # middle doesn't: the answer is bigger
      return low, checks


  print(smallest_side(50))
  print(smallest_side(1_000_000))
---
One idea the paper needs, before the questions start (question 6 uses it). Binary search, from the Puzzle Room, finds a value in a sorted list. It can also search for an *answer*.

Some questions ask for the smallest number that works, and you can check any one guess with a yes or no. If the answer flips from no to yes only once as the guesses grow, so that every number above a yes is also a yes, there's no need to try them all. Check the middle of what's possible, and throw away the half the answer can't be in. When the middle works, keep it, since it might be the answer: `high = middle`.

The example finds the smallest square board for 50 tiles, 8, in 6 checks, and for a million tiles in 20.
