---
id: learn-totals
type: learn
title: A total for each kind
concept: dict-get
code: |
  orders = ["tea", "coffee", "tea", "tea"]
  counts = {}
  for drink in orders:
      counts[drink] = counts.get(drink, 0) + 1
  print(counts)
  for drink in sorted(counts):
      print(drink, counts[drink])
---
To keep a total for each kind of thing, use a dictionary with one key per kind, and add to that key's value each time round a loop.

The trip fund needs a total for each category, and nobody knows in advance which categories will turn up.

The first time a drink appears, it isn't a key yet. `counts.get(drink, 0)` gives 0 for it, and adding 1 makes the key. After that, `.get` gives the count so far. `sorted(counts)` gives the keys in alphabetical order. The example prints the dictionary, then `coffee 1` and `tea 3`.

The usual slip is `counts[drink] = counts[drink] + 1`. It crashes with a KeyError on the first of every drink.
