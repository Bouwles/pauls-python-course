---
id: make
type: make
title: Make the merchant's merge sort
files: [sorter.py]
entry: sorter.py
on_pass: { nell: "Lightest first, and every tie in the order it came off the lorry. The merchant can't argue with that." }
hints:
  nudge: "After one round of merging pairs, how many piles are left? And what happens to the last pile when there's an odd number?"
  plan:
    - Start an empty pile, and a finger at the front of each
    - While both piles have parts left
    - Take the lighter front part by key; on a tie, take from the left
    - Tip whatever's left on the end
    - Hand back the merged pile
    - "merge_sort: make every item a pile of one"
    - "While there's more than one pile, merge them in pairs into a new list of piles; an odd one out goes straight through"
    - Hand back the one pile left, or an empty list
  shape: |
    def merge(left, right, key):
        ...
            if key(left[next_left]) ___ key(right[next_right]):
        ...


    def merge_sort(items, key=lambda item: item):
        piles = [[item] for item in items]
        while len(piles) > 1:
            merged_piles = []
            for start in range(0, len(piles), ___):
                if start + 1 < len(piles):
                    merged_piles.append(merge(___, ___, key))
                else:
                    merged_piles.append(___)
            piles = merged_piles
        if piles:
            return ___
        return []
---
Write `merge` and `merge_sort` in `sorter.py`. Moss's merge is most of `merge`; yours compares `key(...)` of the two front parts, as `sorted` does, and keeps the `<=` so that ties go left.

For `merge_sort`, start with `piles = [[item] for item in items]`. Each round, merge piles 0 and 1, 2 and 3, and so on into a new list of piles. Stop when one is left.

Then finish the main block: sort the pier's lot, check it against `sorted()`, and time both.

The hidden checks sort empty piles, odd piles, piles in order and back to front, check every tie, and count how often your code calls `key` on four thousand parts.
