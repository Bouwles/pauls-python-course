---
id: learn-hash
type: learn
title: A number for every name
concept: hashing
dialogue:
  - paul.thinking.think: "A dict never walks along. It does a sum on the key, and the sum says where to look."
code: |
  def letter_sum(name):
      total = 0
      for character in name:
          total = total + ord(character)
      return total


  print(letter_sum("bolt"), letter_sum("bolt") % 8)
  print(letter_sum("gear"), letter_sum("gear") % 8)
  print(letter_sum("bolt") % 8)
---
A **hash function** turns a name into a number, and the same name always gives the same number. Picture a post room with eight pigeonholes, numbered 0 to 7: the number says which one a name's letter goes in, so finding it again means doing the same sum and going straight there.

`ord(character)` gives a letter's number: `ord("b")` is 98. `letter_sum` adds them up. The remainder by 8, `% 8`, is always a whole number from 0 to 7, one for each pile. The example prints `433 1`, `415 7`, then `1` again for `bolt`.

The usual slip is to think different names always get different piles. They can share one. That's a **collision**, and it's allowed.
