---
id: reading
type: reading
title: How a dictionary works
---
Python's `dict` is a **hash map**. It keeps a row of piles. To store a key, it works out the key's hash and takes the remainder by the number of piles: that's the pile. To find the key again, it does the same sum and looks in that one pile.

Two keys in one pile is a **collision**. The pile holds both, as a short list of pairs, and a lookup compares names along that pile until it finds the right one. Each comparison is a **probe**.

While the piles stay short, a lookup costs a probe or two however many keys there are: O(1) on average. So when the keys outnumber three-quarters of the piles, the map doubles its piles and moves every key to its new pile. That's slow once, and rare: each doubling buys as many puts again before the next.
