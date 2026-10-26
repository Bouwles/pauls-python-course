---
id: make
type: make
title: Make the sorting visualiser
files: [piles.py, sorter.py]
entry: sorter.py
starter_from: make-piles
on_pass: { nell: "Lightest first, and every tie in the order it came off the lorry. The merchant can't argue with that." }
hints:
  nudge: "Merge sort starts with every part as a pile of one and merges them up. Quick sort starts with one pile and splits it down. How many piles are there after one round of each?"
  plan:
    - "merge: an empty pile and a finger at the front of each; take the lighter front part by key, ties from the left; tip the rest on the end"
    - "merge_sort: every item a pile of one; merge them in pairs, round after round, an odd one out going straight through"
    - "quick_sort: one pile of everything; while any pile has two or more parts, split each round its first part"
    - "A split: lighter as one pile, each part the same as the pivot as a pile of its own, heavier as one pile"
    - "Both: after every round, put the piles laid end to end on frames, if there is a frames list"
  shape: |
    def merge_sort(items, key=lambda item: item, frames=None):
        piles = [[item] for item in items]
        while len(piles) > 1:
            merged_piles = []
            for start in range(0, len(piles), ___):
                if start + 1 < len(piles):
                    merged_piles.append(merge(___, ___, key))
                else:
                    merged_piles.append(___)
            piles = merged_piles
            if frames is not None:
                frames.append([item for pile in piles for item in pile])
        if piles:
            return ___
        return []


    def quick_sort(items, key=lambda item: item, frames=None):
        piles = [list(items)]
        while any(len(pile) > 1 for pile in piles):
            split_piles = []
            for pile in piles:
                ...
                pivot = key(___)
                lighter = [item for item in pile if key(item) < pivot]
                ...
---
The second half, in `sorter.py`: `merge`, `merge_sort` and `quick_sort`, each taking a `key` as `sorted` does. Your `piles.py` comes with you, and the visualiser at the bottom is written: it asks which sort to show, plays its frames, then races merge and quick against `sorted()` on the pier lot.

Both new sorts work in rounds, and a frame is every pile after a round, laid end to end. Merge sort merges piles of one in pairs until one is left, comparing `key(...)` of the front parts. Quick sort is Pip's, fixed, by rounds: split every pile of two or more round its first part. A part that weighs the same as the pivot is finished: a pile of one.

Ties keep their order in both. The hidden checks sort empty, odd, ordered and back-to-front piles, check every tie, and count how often merge sort calls `key`.
