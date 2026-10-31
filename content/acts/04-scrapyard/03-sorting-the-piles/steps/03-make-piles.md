---
id: make-piles
type: make
title: Two sorts, frame by frame
files: [piles.py]
entry: piles.py
on_pass: { yahya: "Six passes each. Insertion sort barely touched the tidy pile. Selection sort never noticed it was tidy." }
hints:
  nudge: "Selection sort needs a loop inside a loop. What does the outer one count, and what does the inner one look for? And where in the outer loop is a pass finished?"
  plan:
    - "draw: one line per weight, the weight right-aligned in three places, a space, then its #s"
    - "selection_sort: for each place from the front, find the position of the lightest from there on"
    - "selection_sort: swap it into that place, once, then put a copy of the pile on frames"
    - "insertion_sort: take each one in turn, from the second"
    - Pick it up
    - While the one to its left is heavier, move that one right
    - Put it down in the gap, then put a copy of the pile on frames
  shape: |
    def draw(pile):
        return "\n".join(f"{weight:>3} {___}" for weight in pile)


    def selection_sort(weights, frames=None):
        for start in range(len(weights) - 1):
            lightest = ___
            for position in range(___, len(weights)):
                if weights[position] < weights[lightest]:
                    lightest = ___
            weights[start], weights[lightest] = ___, ___
            if frames is not None:
                frames.append(___)
---
The first half of the visualiser, in `piles.py`. `draw(pile)` gives back the pile as bars, one line per weight:

```
  7 #######
  3 ###
 12 ############
```

`selection_sort` and `insertion_sort` sort lightest first, change the list they're given and hand back `None`, like `.sort()`. Each also takes a `frames` list: after every pass, a copy of the pile goes on it, `list(weights)`, so the passes can be played back. Without the copy, every frame would be the same pile, showing only the end.

Selection sort is the predict, done for every place in turn; insertion sort is Paul's spanners, the other way round. Press Step through to watch them too.

The hidden checks sort empty piles, repeats, piles in order and back to front, count how often selection sort writes to the pile, and how often insertion sort compares weights on a pile already sorted.
