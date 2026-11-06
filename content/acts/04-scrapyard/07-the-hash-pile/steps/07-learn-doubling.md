---
id: learn-doubling
type: learn
title: More piles as it fills
concept: hash-maps
code: |
  for number in [13, 21, 30]:
      print(number, "in 8 piles: pile", number % 8, "  in 16 piles: pile", number % 16)
---
As a hash map fills, its piles get longer and lookups take more probes. So it watches its **load**: names divided by piles. When the load goes over 0.75, it doubles the number of piles.

Then every pair has to move. A pile number is the hash's remainder by the number of piles, so with twice the piles, many names belong somewhere else. Picture the post room getting sixteen pigeonholes instead of eight: every letter is sorted again.

In the example, 21 stays in pile 5, but 13 moves from pile 5 to pile 13.

Moving everything is slow, but rare: each doubling makes room for as many names again. The usual slip is to add the new piles and leave the old pairs where they were.
