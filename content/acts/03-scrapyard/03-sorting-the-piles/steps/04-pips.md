---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Quicksort. Seven lines, and it's the quick one. It's in the name."
  - pip: "Nell put three 7 kg engines in. One came out. I don't know where the others went."
dialogue_after:
  - pip: "Same as the pivot isn't lighter or heavier. It's its own pile. Fair enough."
hints:
  nudge: "Pip makes a pile of lighter parts and a pile of heavier ones. Where does a part go that weighs exactly the same as the pivot?"
  plan:
    - Count the 7s going in and coming out
    - Find the parts that land in neither pile
    - Keep a third pile for the ones that weigh the same as the pivot, and join it in the middle
  shape: |
    lighter = [weight for weight in pile if weight < pivot]
    same = [weight for weight in pile if ___]
    heavier = [weight for weight in pile if weight > pivot]
    return quick_sort(lighter) + ___ + quick_sort(heavier)
---
**Quicksort** picks one part, the pivot, and splits the rest round it: lighter, the same, heavier. Each smaller pile is sorted the same way, then the three are joined in order. Every split roughly halves the work, so on a jumbled pile it's O(n log n).

`quick_sort` calls itself to sort the smaller piles. The junk tower job is all about functions that do that. For now, trust it to sort a smaller pile, and look at what goes into the piles.

Run it and count the 7s. Then fix it.
