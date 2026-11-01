---
id: make-tower
type: make
title: Boxes in boxes
files: [tower.py]
entry: tower.py
dialogue:
  - paul.thinking.think: "The clock's spare weight is in my cupboard somewhere. Boxes in boxes in boxes."
on_pass: { paul.laughing: "Position one, then one, then nought. Found in one pass. Now I've no excuse about the clock." }
---
Paul's cupboard is crates inside crates. A crate is a list, and each thing in it is either a part, a `(name, kg)` pair, or another crate. Write three functions in `tower.py`, each of which calls itself.

1. `total_weight(crate)` gives back the weight of every part in it, however deep.
2. `depth(crate)` gives back how many crates deep it goes. A crate with no crates inside, empty or not, is 1.
3. `path_to(crate, name)` gives back the list of positions that lead from the outside crate to the first part with that name, or `None` if there isn't one. First means searching in order, and going into each crate before moving past it.

```
TOWER = [("bell", 1), [("gear", 2), [("clock-weight", 30)]], ("lamp", 3)]
total_weight(TOWER)              gives  36
depth(TOWER)                     gives  3
path_to(TOWER, "clock-weight")   gives  [1, 1, 0]
```

The hidden checks try empty crates, lopsided towers, and one two hundred crates deep.
