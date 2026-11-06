---
id: learn-copy
type: learn
title: How deep a copy goes
concept: copying
code: |
  import copy

  standing = {"Paul": {"buns": 4}}
  shallow = standing.copy()
  deep = copy.deepcopy(standing)

  print(shallow is standing, shallow["Paul"] is standing["Paul"])
  print(deep is standing, deep["Paul"] is standing["Paul"])
---
`.copy()` makes a new dictionary. But when the values are dictionaries themselves, it fills the new one with labels on the same inner boxes. That's a **shallow** copy: new on the outside, shared inside.

`copy.deepcopy()`, from the `copy` module, copies the inner boxes too, and theirs, all the way down. Nothing in a deep copy is shared.

Caitlin's sheets are dictionaries of dictionaries. A shallow copy of one shares every count inside it.

The example prints `False True`: a new outer box, the same inner one. Then `False False`: nothing shared. For a flat dictionary, with no boxes inside, `.copy()` is enough.

The usual slip is to think `.copy()` copies everything. It copies one level.
