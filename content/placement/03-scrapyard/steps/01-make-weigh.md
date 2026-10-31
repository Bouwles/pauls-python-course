---
id: make-weigh
type: make
title: Caitlin's hardware shelves
files: [weighbridge.py]
entry: weighbridge.py
dialogue:
  - caitlin: "Someone gave the Makerspace a box of old hardware. Lightest first for the top shelf. Ties stay in box order."
on_pass: { caitlin: "Lightest first, ties in box order, and it finds the three-kilo end in a couple of dozen looks." }
---
Parts are `(name, kg)` pairs. Write two functions in `weighbridge.py`, by hand: no `sorted`, `.sort()` or `bisect`.

1. `sort_parts(parts)` gives back a new list, lightest first. Parts of the same weight stay in the order they were given. `parts` itself is left as it was.
2. `first_at_least(parts, kg)` takes parts already sorted lightest first and gives back the position of the first part weighing at least `kg`, or `len(parts)` if none do.

```
sort_parts([("monitor", 4), ("mouse", 1), ("speaker", 4)])
    gives  [("mouse", 1), ("monitor", 4), ("speaker", 4)]
first_at_least([("mouse", 1), ("monitor", 4), ("speaker", 4)], 4)
    gives  1
```

The hidden checks count every comparison `sort_parts` makes on four thousand parts, and every part `first_at_least` looks at in a pile of a million. An O(n log n) sort and a binary search are well inside the limits.
