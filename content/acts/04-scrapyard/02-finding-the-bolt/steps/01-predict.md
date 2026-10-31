---
id: predict
type: predict
title: One at a time
concept: linear-search
code: |
  def find(pile, wanted):
      looks = 0
      for position in range(len(pile)):
          looks = looks + 1
          if pile[position] == wanted:
              return position, looks
      return -1, looks


  pile = ["hubcap", "spring", "bolt", "kettle", "bolt", "gear"]
  print(find(pile, "bolt"))
  print(find(pile, "piston"))
question: What does this print?
options:
  - text: |-
      (2, 3)
      (-1, 6)
    correct: true
    feedback: "Right. It stops at the first bolt, after three looks. To be sure there's no piston, it has to look at all six."
  - text: |-
      (4, 5)
      (-1, 6)
    misconception: search-finds-last
    feedback: "`return` leaves the function the moment it runs, so the search stops at the first bolt it meets, in position 2. The second bolt is never looked at."
  - text: |-
      (2, 3)
      (-1, 0)
    misconception: missing-costs-nothing
    feedback: "Nothing can say the piston isn't there without looking at every part. A miss is the slowest search of all: six looks."
  - text: |-
      (3, 3)
      (-1, 6)
    misconception: index-from-one
    feedback: "Positions count from 0: hubcap is 0, spring 1, bolt 2. It took three looks to reach position 2."
after: |
  Run it. Then add four more parts to the pile and search for the piston again.
---
This is how Riya searches the list: look at each part in turn until it's the one she wants. It's called a **linear search**, and it works on any pile, in any order.

`find` gives back two things: where it found the part, or `-1` if it didn't, and how many parts it looked at.
