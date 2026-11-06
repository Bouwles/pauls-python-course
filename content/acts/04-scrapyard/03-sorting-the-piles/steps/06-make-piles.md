---
id: make-piles
type: make
title: Two sorts, frame by frame
files: [piles.py]
entry: piles.py
on_pass: { neil.surprised: "Six passes each. Insertion sort barely touched the tidy pile. Selection sort never noticed it was tidy." }
hints:
  nudge: "Selection sort needs a loop inside a loop. What does the outer one count, and what does the inner one look for? And where in the outer loop is a pass finished?"
  plan:
    - "draw: one line per lap, its tenths right-aligned in three places, a space, then its #s"
    - "selection_sort: for each place from the front, find the position of the fastest from there on"
    - "selection_sort: swap it into that place, once, then put a copy of the pile on frames"
    - "insertion_sort: take each one in turn, from the second"
    - Pick it up
    - While the one to its left belongs after it, move that one right
    - Put it down in the gap, then put a copy of the pile on frames
  shape: |
    def draw(pile):
        return "\n".join(f"{lap:>3} {___}" for lap in pile)


    def selection_sort(laps, frames=None):
        for start in range(len(laps) - 1):
            fastest = ___
            for position in range(___, len(laps)):
                if laps[position] < laps[fastest]:
                    fastest = ___
            laps[start], laps[fastest] = ___, ___
            if frames is not None:
                frames.append(___)
---
The first half of the visualiser, in `piles.py`. `draw(pile)` gives back the pile as bars, one line per lap, a `#` for every tenth off the record:

```
  7 #######
  3 ###
 12 ############
```

`selection_sort` and `insertion_sort` sort fastest first, change the list they're given and hand back `None`, like `.sort()`. Each also takes a `frames` list: after every pass, a copy of the pile goes on it, `list(laps)`, so the passes can be played back. Without the copy, every frame would be the same list, showing only the end.

Selection sort is "Fastest to the front"; insertion sort is Paul's marking, fastest first.

The hidden checks sort empty piles, repeats, piles in order and back to front, count how often selection sort writes to the pile, and how often insertion sort compares laps on a pile already sorted.
