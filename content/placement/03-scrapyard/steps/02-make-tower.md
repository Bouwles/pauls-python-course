---
id: make-tower
type: make
title: The junk tower
files: [tower.py]
entry: tower.py
dialogue:
  - nell: "Crates in crates in crates. The anvil's in there somewhere. I can feel it."
on_pass: { nell: "Position one, then one, then nought. The anvil, exactly where I'd have put my hand." }
---
Nell's tower is crates inside crates. A crate is a list, and each thing in it is either a part, a `(name, kg)` pair, or another crate. Write three functions in `tower.py`, each of which calls itself.

1. `total_weight(crate)` gives back the weight of every part in it, however deep.
2. `depth(crate)` gives back how many crates deep it goes. A crate with no crates inside, empty or not, is 1.
3. `path_to(crate, name)` gives back the list of positions that lead from the outside crate to the first part with that name, or `None` if there isn't one. First means searching in order, and going into each crate before moving past it.

```
TOWER = [("bell", 1), [("gear", 2), [("anvil", 30)]], ("lamp", 3)]
total_weight(TOWER)       gives  36
depth(TOWER)              gives  3
path_to(TOWER, "anvil")   gives  [1, 1, 0]
```

The hidden checks try empty crates, lopsided towers, and one two hundred crates deep.
