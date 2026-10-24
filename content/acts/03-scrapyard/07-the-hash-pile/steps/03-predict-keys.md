---
id: predict-keys
type: predict
title: What can be a key
concept: hashing
code: |
  bins = {}
  bins[("bolt", "M8")] = 40
  bins[["bolt", "M6"]] = 25
  print(bins)
question: What happens?
verify: crash-line
options:
  - text: It crashes on line 3, with the list
    correct: true
    feedback: "Right. A list can change, so it can't be a key: TypeError, unhashable type. The tuple on line 2 can't change, so it's filed without any fuss."
  - text: It crashes on line 2, with the tuple
    misconception: tuples-cannot-be-keys
    feedback: "A tuple can be a key, as long as everything in it can. It never changes, so its hash never changes, and it stays findable in its pile."
  - text: It prints both pairs
    misconception: lists-can-be-keys
    feedback: "A list can't be a key. If it changed after it was filed, its hash would change, and the dict would look in the wrong pile for it for ever."
---
A key's pile comes from its hash. If a key changed after it was filed, its hash would change with it, and the dictionary would look for it in the wrong pile.

So Python only takes keys that can't change: strings, numbers, and tuples of them.
