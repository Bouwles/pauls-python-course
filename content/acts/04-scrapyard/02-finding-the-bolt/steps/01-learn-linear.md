---
id: learn-linear
type: learn
title: Looking at each in turn
concept: linear-search
dialogue:
  - neil.laughing: "This is Caitlin's method. Top of the list, one at a time, until she gives up."
code: |
  def find(pile, wanted):
      looks = 0
      for position in range(len(pile)):
          looks = looks + 1
          if pile[position] == wanted:
              return position, looks
      return -1, looks


  pile = ["chain", "spring", "gear", "visor", "nut"]
  print(find(pile, "visor"))
  print(find(pile, "turbo"))
---
A **linear search** looks at each item in turn, from the front, until it finds the one it wants.

It works on any list, in any order. The price is the looks. An item near the end takes nearly n of them. An item that isn't there takes all n, because nothing can say it's missing without checking everything. That's O(n).

`find` gives back two things: where it found the item, and how many looks it took. Positions count from 0, so the visor is at 3, after 4 looks. For a missing item it gives `-1`, the usual way to say not found. The example prints `(3, 4)`, then `(-1, 5)`.

The usual slip is to expect it to carry on after a match. `return` leaves the function at once.
