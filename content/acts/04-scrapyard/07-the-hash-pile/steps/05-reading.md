---
id: reading
type: learn
title: Piles and probes
concept: hash-maps
code: |
  piles = [[], [], [], []]


  def pile_for(name):
      return len(name) % len(piles)


  for name, count in [("bolt", 40), ("nut", 25), ("gear", 3)]:
      piles[pile_for(name)].append((name, count))
  print(piles)

  probes = 0
  for stored, count in piles[pile_for("gear")]:
      probes = probes + 1
      if stored == "gear":
          print("gear:", count, "after", probes, "probes")
          break
---
Python's `dict` is a **hash map**: a row of piles. To store a key and its value, it puts the pair in the pile the key's hash picks. To find the key again, it goes to that pile and compares keys along it until one matches. Each comparison is a **probe**.

The example uses a rough rule, the length of the name, with four piles. `bolt` and `gear` both have four letters, so they collide in pile 0, and finding `gear` takes two probes.

While the piles stay short, a lookup costs a probe or two however many keys there are: O(1) on average. The usual slip is to picture a dict comparing the key with every key it holds. It looks in one pile.
