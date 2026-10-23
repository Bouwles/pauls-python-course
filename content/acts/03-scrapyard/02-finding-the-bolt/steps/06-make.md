---
id: make
type: make
title: Make Nell's bolt finder
files: [bolts.py]
entry: bolts.py
on_pass: { nell: "Ten looks for eight hundred drawers. I'd have bet my gloves against it." }
hints:
  nudge: "For `find_bolt`, what are the first and last drawers the bolt could be in, before you've opened anything?"
  plan:
    - Mark the first and last place it could be
    - While there's anywhere left to look
    - Look in the middle
    - "Found it: say where"
    - "Too small: throw away the middle and everything before it"
    - "Too big: throw away the middle and everything after it"
    - "Nowhere left: say so"
    - "count_between: where the low end would go, where the high end would go, and the gap between"
    - "add_bolt: find the drawer with bisect_right, then insert it there"
  shape: |
    def find_bolt(sizes, size):
        low = 0
        high = ___
        while low ___ high:
            middle = ___
            if sizes[middle] == size:
                return ___
            if sizes[middle] < size:
                low = ___
            else:
                high = ___
        return -1


    def count_between(sizes, low, high):
        if low > high:
            return ___
        return bisect.___(sizes, high) - bisect.___(sizes, low)


    def add_bolt(sizes, size):
        drawer = bisect.___(sizes, size)
        sizes.___(drawer, size)
        return drawer
---
Write the three functions from the brief in `bolts.py`. Penhallow's rack is in there, and a first line for the main block.

`find_bolt` is Moss's search from Mrs Vance's cards, on numbers. The other two are a line or two each with `bisect`. `sizes.insert(drawer, size)` puts a bolt in at a drawer and moves the rest along.

The hidden checks open every drawer of the small rack, try racks with one drawer and none, and hand your functions a rack of a million that counts every drawer they open.
