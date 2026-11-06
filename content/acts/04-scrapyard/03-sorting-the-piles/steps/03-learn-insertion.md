---
id: learn-insertion
type: learn
title: Sliding into place
concept: simple-sorts
code: |
  laps = [6, 4, 9, 1]
  for position in range(1, len(laps)):
      current = laps[position]
      slot = position
      while slot > 0 and laps[slot - 1] > current:
          laps[slot] = laps[slot - 1]
          slot = slot - 1
      laps[slot] = current
      print(laps)
---
**Insertion sort** is how most people sort a hand of cards. Take each card in turn, from the second, and slide it left past every card that belongs after it. Everything to its left is in order already, so it stops at the first card that belongs before it.

In code: pick the lap up into `current`, move each slower lap one place right, and put `current` down in the gap. The example prints the pile after each lap is placed: `[4, 6, 9, 1]`, `[4, 6, 9, 1]`, `[1, 4, 6, 9]`.

On a pile nearly in order, hardly anything slides, so it's quick. Jumbled, it's O(n²). The usual slip is to slide before picking the lap up: the first slide copies over it.
