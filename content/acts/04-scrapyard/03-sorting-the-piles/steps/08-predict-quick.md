---
id: predict-quick
type: predict
title: After one split
concept: quicksort
code: |
  pile = [4, 7, 1, 4, 6, 2]
  pivot = pile[0]
  faster = [lap for lap in pile if lap < pivot]
  same = [lap for lap in pile if lap == pivot]
  slower = [lap for lap in pile if lap > pivot]
  print(faster + same + slower)
question: What does this print?
options:
  - text: "[1, 2, 4, 4, 7, 6]"
    correct: true
    feedback: "Right. One split puts every lap on the correct side of the 4s, keeping the order they came in. `[7, 6]` is still the wrong way round: that pile gets its own split next round."
  - text: "[1, 2, 4, 4, 6, 7]"
    misconception: split-sorts-piles
    feedback: "A split only decides which side of the pivot each lap goes. Inside each pile the laps keep the order they came in, so `7` stays ahead of `6` until that pile is split too."
  - text: "[1, 2, 4, 7, 6]"
    misconception: pivot-kept-once
    feedback: "`same` collects every lap equal to the pivot, the pivot included. There are two 4s, and both are kept."
---
One round of quicksort on a pile with two laps at four tenths. `+` joins the three lists into one.
