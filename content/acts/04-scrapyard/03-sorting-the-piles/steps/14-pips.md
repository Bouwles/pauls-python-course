---
id: pips
type: pips
title: Fix Yahya's version
dialogue:
  - yahya.proud.wave: "Can you look at mine? Quicksort. Seven lines, and it's the quick one. It's in the name."
  - yahya.unimpressed: "I put in three laps at seven tenths. One came out. Very quickly, but still."
dialogue_after:
  - yahya.thinking: "Same as the pivot isn't faster or slower. It's its own pile. Fair enough."
hints:
  nudge: "Yahya makes a pile of faster laps and a pile of slower ones. Where does a lap go that's exactly as quick as the pivot?"
  plan:
    - Count the 7s going in and coming out
    - Find the laps that land in neither pile
    - Keep a third pile for the ones with the same time as the pivot, and join it in the middle
  shape: |
    faster = [lap for lap in pile if lap < pivot]
    same = [lap for lap in pile if ___]
    slower = [lap for lap in pile if lap > pivot]
    return quick_sort(faster) + ___ + quick_sort(slower)
---
Yahya's quicksort splits round the first lap, as in "Split round a pivot". To sort each smaller pile, `quick_sort` calls itself. A function may do that, and the next project is all about it. For now, trust it to sort a smaller pile, and look at what goes into the piles.

Run it and count the 7s going in and coming out.
