---
id: make-piles
type: make
title: Two sorts by hand
files: [piles.py]
entry: piles.py
on_pass: { nell: "Both piles lightest first. One of them barely broke a sweat on the tidy pile." }
hints:
  nudge: "Selection sort needs a loop inside a loop. What does the outer one count, and what does the inner one look for?"
  plan:
    - "selection_sort: for each place from the front, find the position of the lightest from there on"
    - "selection_sort: swap it into that place, once"
    - "insertion_sort: take each one in turn, from the second"
    - Pick it up
    - While the one to its left is heavier, move that one right
    - Put it down in the gap
  shape: |
    def selection_sort(weights):
        for start in range(len(weights) - 1):
            lightest = ___
            for position in range(___, len(weights)):
                if weights[position] < weights[lightest]:
                    lightest = ___
            weights[start], weights[lightest] = ___, ___


    def insertion_sort(weights):
        for position in range(1, len(weights)):
            current = weights[position]
            slot = position
            while slot > 0 and weights[slot - 1] ___ current:
                weights[slot] = ___
                slot = slot - 1
            weights[slot] = ___
---
Write `selection_sort` and `insertion_sort` in `piles.py`, lightest first. Both change the list they're given and hand back `None`, like `.sort()`. Selection sort is the predict, done for every place in turn; insertion sort is Moss's spanners, the other way round.

Sort the pile in the main block and press Step through to watch each one work.

The hidden checks sort empty piles, repeats, piles already in order and back to front, and count two things: how often selection sort writes to the pile, and how often insertion sort compares weights on a pile that's already sorted.
