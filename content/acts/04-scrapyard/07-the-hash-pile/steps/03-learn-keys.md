---
id: learn-keys
type: learn
title: Keys that can't change
concept: hashing
error: TypeError
code: |
  bins = {}
  bins["washer"] = 300
  bins[("bolt", "M8")] = 40
  print(bins)

  bins[["bolt", "M6"]] = 25
---
A key's pile comes from its hash. If a key changed after it was filed, its hash would change with it, and the dictionary would look for it in the wrong pile for ever.

So Python only takes keys that can't change. Things that can be keys are called **hashable**: strings, numbers, and tuples of them. A list can change, so it can't be a key, and nor can a dictionary.

The example files a string and a tuple without fuss and prints both. The last line tries a list, and stops with a `TypeError`: a list can't be a key.

The usual slip is to think a tuple can't be a key because it holds several things. It can, as long as everything inside it can.
