---
id: learn-binary
type: learn
title: Halving a sorted list
concept: binary-search
code: |
  def find(numbers, wanted):
      low = 0
      high = len(numbers) - 1
      while low <= high:
          middle = (low + high) // 2
          print("Looking at position", middle, "which holds", numbers[middle])
          if numbers[middle] == wanted:
              return middle
          elif numbers[middle] < wanted:
              low = middle + 1
          else:
              high = middle - 1
      return -1


  karts = [2, 5, 7, 11, 14, 19, 23, 28, 31]
  print(find(karts, 23))
---
**Binary search** finds an item in a sorted list by halving it. Picture a dictionary: open it in the middle, see whether your word comes before or after that page, and forget the half it can't be in. Repeat with what's left.

`low` and `high` are the first and last positions the item could still be at. Each pass looks at `middle`, halfway between. Too small: `low = middle + 1`. Too big: `high = middle - 1`. When `low` passes `high`, there's nowhere left, so it returns `-1`.

The example finds kart 23 in two looks, at positions 4 and 6. Text compares alphabetically, so names work too.

The usual slip is to use it on a list that isn't sorted. It throws away the wrong half and says the item isn't there.
