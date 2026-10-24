---
id: make-weigh
type: make
title: Nell's weighbridge
files: [weighbridge.py]
entry: weighbridge.py
dialogue:
  - nell: "The merchant wants them lightest first. Same weight, same order they came off the lorry. He's particular."
on_pass: { nell: "Lightest first, ties as they came, and it finds the three-kilo end in a couple of dozen looks." }
---
Parts are `(name, kg)` pairs. Write two functions in `weighbridge.py`, by hand: no `sorted`, `.sort()` or `bisect`.

1. `sort_parts(parts)` gives back a new list, lightest first. Parts of the same weight stay in the order they were given. `parts` itself is left as it was.
2. `first_at_least(parts, kg)` takes parts already sorted lightest first and gives back the position of the first part weighing at least `kg`, or `len(parts)` if none do.

```
sort_parts([("hubcap", 4), ("gear", 1), ("spring", 4)])
    gives  [("gear", 1), ("hubcap", 4), ("spring", 4)]
first_at_least([("gear", 1), ("hubcap", 4), ("spring", 4)], 4)
    gives  1
```

The hidden checks count every comparison `sort_parts` makes on four thousand parts, and every part `first_at_least` looks at in a pile of a million. An O(n log n) sort and a binary search are well inside the limits.
