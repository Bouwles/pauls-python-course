---
id: learn-set
type: learn
title: One of each
concept: sets
code: |
  box = ["umbrella", "glove", "umbrella", "scarf"]
  items = set(box)
  print(len(items))
  print(sorted(items))

  items.add("hat")
  items.add("glove")
  print(len(items))
---
A **set** is a collection that holds each value once. `set(box)` makes one from a list and keeps one copy of everything in it, so an umbrella written down three times is one umbrella.

That's exactly Caitlin's problem with the lost property box.

`.add()` puts a value in. Adding one that's already there changes nothing. You can also write a set in curly brackets, `{"glove", "scarf"}`. But `{}` on its own is an empty dictionary, so an empty set is `set()`.

A set has no order. `sorted(items)` gives its values as an alphabetical list, for showing. The example prints `3`, `['glove', 'scarf', 'umbrella']`, then `4`.

The usual slip is to expect a set to keep the order things went in.
